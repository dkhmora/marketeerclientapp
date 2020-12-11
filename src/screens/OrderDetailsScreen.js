import React, {Component} from 'react';
import {Card, CardItem, Left, Right} from 'native-base';
import {View, ActivityIndicator} from 'react-native';
import {
  Text,
  Input,
  Icon,
  Button,
  Badge,
  Image,
  Divider,
} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import CartListItem from '../components/CartListItem';
import {inject, observer} from 'mobx-react';
import ConfirmationModal from '../components/ConfirmationModal';
import * as Animatable from 'react-native-animatable';
import Toast from '../components/Toast';
import {computed, when} from 'mobx';
import PrimaryActivityIndicator from '../components/PrimaryActivityIndicator';
import crashlytics from '@react-native-firebase/crashlytics';
import MapCardItem from '../components/MapCardItem';
import CardItemHeader from '../components/CardItemHeader';
import {cancelOrder} from '../util/firebase-functions';
import {getOrderPayment, getOrderItems} from '../util/firebase-firestore';
import {openLink} from '../util/helpers';
import Pill from '../components/Pill';

@inject('generalStore')
@inject('authStore')
@observer
class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderItems: null,
      orderPayment: null,
      itemsReady: false,
      confirmCancelOrderModal: false,
      cancelReasonCheck: false,
      cancelReasonInput: '',
      cancelOrderLoading: false,
      paymentProcessing: false,
      courierCoordinates: null,
      allowDragging: true,
    };
  }

  componentDidMount() {
    const {orderId, openPaymentLink} = this.props.route.params;

    this.props.generalStore.getOrder({orderId, readMessages: false});

    getOrderItems(orderId).then((orderItems) => {
      this.setState({orderItems, itemsReady: true});
    });

    if (openPaymentLink) {
      when(
        () =>
          this.props.generalStore.selectedOrder &&
          this.props.generalStore.selectedOrder.paymentLink,
        () => this.openPaymentLink(),
      );
    }

    crashlytics().log('OrderDetailsScreen');
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.generalStore.selectedOrder) {
      const {paymentMethod} = this.props.generalStore.selectedOrder;

      if (paymentMethod === 'Online Banking' && !this.state.orderPayment) {
        if (
          Object.keys(this.props.generalStore.availablePaymentMethods)
            .length === 0
        ) {
          await this.props.generalStore.setAppData();
        }

        const {orderId} = this.props.generalStore.selectedOrder;

        if (
          !this.props.generalStore.selectedOrder.orderStatus.pending.status &&
          !this.props.generalStore.selectedOrder.orderStatus.cancelled.status &&
          !this.state.paymentProcessing
        ) {
          await getOrderPayment(orderId).then((orderPayment) => {
            this.setState({orderPayment});
          });
        }
      }

      if (
        this.props.generalStore.selectedOrder.deliveryMethod === 'Mr. Speedy' &&
        this.props.generalStore.selectedOrder.mrspeedyBookingData &&
        this.props.generalStore.selectedOrder.mrspeedyBookingData.order
      ) {
        if (
          this.props.generalStore.selectedOrder.mrspeedyBookingData.order
            .courier &&
          this.props.generalStore.selectedOrder.mrspeedyBookingData.order
            .status === 'active' &&
          !this.props.generalStore.getCourierInterval
        ) {
          this.setCourierInfo();

          this.props.generalStore.getCourierInterval = setInterval(() => {
            this.setCourierInfo();
          }, 10000);
        }
      }
    }
  }

  componentWillUnmount() {
    this.props.generalStore.selectedOrder = null;

    this.props.generalStore.unsubscribeGetOrder &&
      this.props.generalStore.unsubscribeGetOrder();
  }

  setCourierInfo() {
    if (
      this.props.generalStore.selectedOrder &&
      this.props.generalStore.selectedOrder.deliveryMethod === 'Mr. Speedy' &&
      this.props.generalStore.selectedOrder.mrspeedyBookingData &&
      this.props.generalStore.selectedOrder.mrspeedyBookingData.order &&
      this.props.generalStore.selectedOrder.mrspeedyBookingData.order.courier &&
      this.props.generalStore.selectedOrder.mrspeedyBookingData.order.status ===
        'active'
    ) {
      this.props.generalStore
        .getMrSpeedyCourierInfo(
          this.props.generalStore.selectedOrder.mrspeedyBookingData.order
            .order_id,
        )
        .then((response) => {
          if (response.s === 200) {
            const courierInfo = response.d;

            if (courierInfo && courierInfo.latitude && courierInfo.longitude) {
              const courierCoordinates = {
                latitude: Number(courierInfo.latitude),
                longitude: Number(courierInfo.longitude),
              };

              this.setState({courierCoordinates});
            }
          }
        });
    } else {
      this.props.generalStore.clearGetCourierInterval();
    }
  }

  @computed get orderStatus() {
    const {selectedOrder} = this.props.generalStore;

    if (selectedOrder) {
      const {orderStatus} = selectedOrder;

      const statusLabel =
        orderStatus &&
        Object.entries(orderStatus).map(([key, value]) => {
          if (value.status) {
            return key.toUpperCase();
          }

          return null;
        });

      return statusLabel ? statusLabel.filter((item) => item != null) : 'null';
    }

    return null;
  }

  @computed get deliveryPriceText() {
    const {selectedOrder} = this.props.generalStore;

    if (selectedOrder) {
      const {
        deliveryPrice,
        deliveryMethod,
        mrspeedyBookingData,
      } = selectedOrder;

      if (deliveryPrice && deliveryPrice > 0) {
        if (deliveryPrice > 0) {
          return `₱${selectedOrder.deliveryPrice}`;
        }

        return '₱0 (Free Delivery)';
      }

      if (deliveryMethod === 'Mr. Speedy') {
        if (mrspeedyBookingData && mrspeedyBookingData.estimatedOrderPrices) {
          return `₱${mrspeedyBookingData.estimatedOrderPrices.motorbike} - ₱${mrspeedyBookingData.estimatedOrderPrices.car}`;
        }

        return 'To be determined once order is shipped';
      }
    }

    return 'TBD';
  }

  @computed get orderTotalText() {
    const {selectedOrder} = this.props.generalStore;

    if (selectedOrder) {
      const {deliveryPrice, deliveryMethod, subTotal} = selectedOrder;

      if (deliveryPrice && deliveryPrice > 0) {
        return `₱${(subTotal + deliveryPrice).toFixed(2)}`;
      }

      if (deliveryMethod === 'Mr. Speedy') {
        return `₱${subTotal.toFixed(2)} + Delivery Price`;
      }
    }

    return '...';
  }

  @computed get mrspeedyVehicleType() {
    const {selectedOrder} = this.props.generalStore;

    if (selectedOrder?.mrspeedyBookingData?.order !== undefined) {
      return selectedOrder.mrspeedyBookingData.order?.vehicle_type_id === 8
        ? 'Motorbike'
        : 'Car';
    }

    return null;
  }

  handleCancelReasonChange = (cancelReasonInput) => {
    this.setState({cancelReasonInput});

    if (cancelReasonInput !== '') {
      this.setState({
        cancelReasonCheck: true,
      });
    } else {
      this.setState({
        cancelReasonCheck: false,
      });
    }
  };

  handleCancelOrder() {
    const {selectedOrder} = this.props.generalStore;
    const {userOrderNumber} = selectedOrder;

    this.setState({cancelOrderLoading: true}, () => {
      cancelOrder(
        this.props.route.params.orderId,
        this.state.cancelReasonInput,
      ).then((response) => {
        this.setState({
          cancelOrderLoading: false,
          confirmCancelOrderModal: false,
          cancelReasonInput: '',
          cancelReasonCheck: false,
        });

        this.closeModal();

        if (response.data.s !== 500 && response.data.s !== 400) {
          Toast({
            text: `Order # ${userOrderNumber} successfully cancelled!`,
            type: 'success',
            duration: 3500,
          });
        } else {
          this.props.navigation.goBack();

          Toast({
            text: response.data.m,
            type: 'danger',
            duration: 3500,
          });
        }
      });
    });
  }

  closeModal() {
    if (!this.state.cancelOrderLoading) {
      this.setState({
        confirmCancelOrderModal: false,
        cancelReasonInput: '',
        cancelReasonCheck: false,
      });
    }
  }

  openPaymentLink() {
    this.setState({orderPayment: null, paymentProcessing: true}, () => {
      this.props.generalStore
        .toggleAppLoader()
        .then(() => openLink(this.props.generalStore.selectedOrder.paymentLink))
        .then(() => this.props.generalStore.toggleAppLoader());
    });
  }

  openOrderChat() {
    const {navigation} = this.props;
    const {orderId} = this.props.route.params;

    navigation.navigate('Order Chat', {
      orderId,
    });
  }

  render() {
    const {
      state: {
        itemsReady,
        orderItems,
        orderPayment,
        confirmCancelOrderModal,
        cancelReasonCheck,
        cancelReasonInput,
        cancelOrderLoading,
        courierCoordinates,
        allowDragging,
      },
      props: {
        generalStore: {availablePaymentMethods, selectedOrder, navigation},
        authStore: {userName},
      },
      orderStatus,
      mrspeedyVehicleType,
    } = this;
    const paymentGateway = selectedOrder?.processId
      ? availablePaymentMethods[selectedOrder.processId]
      : null;

    const cancelReason = selectedOrder?.orderStatus?.cancelled?.reason;

    const paymentStatus =
      orderPayment &&
      (orderPayment.status === 'S'
        ? 'Success'
        : orderPayment.status === 'F'
        ? 'Failure'
        : orderPayment.status === 'P'
        ? 'Pending'
        : orderPayment.status === 'U'
        ? 'Unknown'
        : orderPayment.status === 'R'
        ? 'Refund'
        : orderPayment.status === 'K'
        ? 'Chargedback'
        : orderPayment.status === 'V'
        ? 'Voided'
        : orderPayment.status === 'A'
        ? 'Authorized'
        : 'Undefined');

    const appliedDeliveryVoucherTitle =
      selectedOrder?.marketeerVoucherDetails?.delivery?.title;
    const appliedDeliveryVoucherAmount =
      selectedOrder?.marketeerVoucherDetails?.delivery?.discount?.amount;

    const finalDeliveryPrice = selectedOrder?.deliveryPrice
      ? Math.max(
          0,
          selectedOrder?.deliveryPrice -
            Number(
              selectedOrder?.deliveryDiscount
                ? selectedOrder.deliveryDiscount
                : 0,
            ) -
            Number(
              appliedDeliveryVoucherAmount !== undefined
                ? appliedDeliveryVoucherAmount
                : 0,
            ),
        )
      : 0;
    const totalAmount =
      (selectedOrder?.subTotal !== undefined ? selectedOrder.subTotal : 0) +
      finalDeliveryPrice;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={
            selectedOrder?.userOrderNumber !== undefined
              ? `Order #${selectedOrder?.userOrderNumber} Details`
              : null
          }
          centerComponent={
            selectedOrder?.userOrderNumber === undefined ? (
              <ActivityIndicator size="small" color={colors.icons} />
            ) : null
          }
          backButton
          optionsIcon="help-circle"
          options={
            orderStatus &&
            (orderStatus[0] === 'PENDING' ||
              orderStatus[0] === 'UNPAID' ||
              (orderStatus[0] === 'PAID' &&
                selectedOrder?.paymentMethod === 'COD'))
              ? ['Cancel Order']
              : null
          }
          actions={[
            () => {
              this.setState({confirmCancelOrderModal: true});
            },
          ]}
          navigation={navigation}
        />

        {selectedOrder ? (
          <View style={{flex: 1}}>
            <ConfirmationModal
              isVisible={confirmCancelOrderModal}
              closeModal={() => closeModal()}
              title={`Cancel Order #${selectedOrder?.userOrderNumber}`}
              loading={cancelOrderLoading}
              confirmDisabled={!cancelReasonCheck}
              body={
                <View>
                  <Input
                    numberOfLines={8}
                    multiline
                    maxLength={600}
                    disabled={cancelOrderLoading}
                    placeholder="Reason for Cancellation"
                    placeholderTextColor={colors.text_secondary}
                    value={cancelReasonInput}
                    onChangeText={(value) =>
                      this.handleCancelReasonChange(value)
                    }
                    style={{
                      borderRadius: 24,
                    }}
                    inputStyle={{textAlignVertical: 'top'}}
                  />

                  {cancelReasonCheck ? (
                    <Animatable.View
                      useNativeDriver
                      animation="bounceIn"
                      style={{position: 'absolute', right: 10, bottom: '50%'}}>
                      <Icon name="check-circle" color="#388e3c" size={20} />
                    </Animatable.View>
                  ) : null}

                  <Text
                    style={{
                      alignSelf: 'flex-end',
                      justifyContent: 'flex-start',
                    }}>
                    Character Limit: {cancelReasonInput.length}/600
                  </Text>
                </View>
              }
              onConfirm={() => {
                this.handleCancelOrder();
              }}
            />

            <ScrollView
              scrollEnabled={allowDragging}
              style={{
                flex: 1,
                flexDirection: 'column',
                marginHorizontal: 6,
                marginVertical: 3,
              }}>
              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                }}>
                <Card
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                  <CardItemHeader
                    onPress={() => this.openOrderChat()}
                    activeOpacity={0.85}
                    title={
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: colors.primary,
                            fontFamily: 'ProductSans-Bold',
                            fontSize: 20,
                          }}>
                          Order Details
                        </Text>

                        <View style={{alignItems: 'center'}}>
                          <View
                            style={{
                              flexDirection: 'row',
                              paddingHorizontal: 5,
                              paddingTop: 5,
                            }}>
                            <Icon
                              name="message-square"
                              color={colors.primary}
                            />

                            {selectedOrder?.userUnreadCount !== undefined &&
                              selectedOrder?.userUnreadCount > 0 && (
                                <Badge
                                  value={selectedOrder?.userUnreadCount}
                                  badgeStyle={{backgroundColor: colors.accent}}
                                  containerStyle={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                  }}
                                />
                              )}
                          </View>
                          <Text
                            style={{
                              color: colors.primary,
                            }}>
                            Chat
                          </Text>
                        </View>
                      </View>
                    }
                  />

                  {selectedOrder ? (
                    <View>
                      <CardItem bordered>
                        <Left>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                            }}>
                            Order ID:
                          </Text>
                        </Left>

                        <Right>
                          <Text
                            style={{
                              fontSize: 16,
                              textAlign: 'right',
                            }}>
                            {selectedOrder?.orderId}
                          </Text>
                        </Right>
                      </CardItem>

                      <CardItem bordered>
                        <Left>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                            }}>
                            Order Status:
                          </Text>
                        </Left>

                        <Right>
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 16,
                              textAlign: 'right',
                            }}>
                            {orderStatus[0] !== 'PAID'
                              ? orderStatus
                              : 'PROCESSING'}
                          </Text>
                        </Right>
                      </CardItem>

                      <CardItem bordered>
                        <Left>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                            }}>
                            Delivery Method:
                          </Text>
                        </Left>

                        <Right>
                          {selectedOrder?.deliveryMethod === 'Mr. Speedy' ? (
                            <Image
                              source={require('../../assets/images/mrspeedy-logo.png')}
                              style={{
                                height: 20,
                                width: 100,
                                resizeMode: 'contain',
                              }}
                            />
                          ) : (
                            <Text
                              style={{
                                fontSize: 16,
                                textAlign: 'right',
                              }}>
                              {selectedOrder?.deliveryMethod}
                            </Text>
                          )}
                        </Right>
                      </CardItem>

                      <CardItem bordered>
                        <Left>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Bold',
                            }}>
                            Payment Method:
                          </Text>
                        </Left>

                        <Right>
                          <Pill
                            title={selectedOrder?.paymentMethod}
                            titleStyle={{fontSize: 16}}
                          />
                        </Right>
                      </CardItem>

                      {appliedDeliveryVoucherTitle !== undefined && (
                        <CardItem bordered>
                          <Left>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'ProductSans-Bold',
                              }}>
                              Voucher/s Applied:
                            </Text>
                          </Left>

                          <Right>
                            <View
                              style={{
                                flexDirection: 'row',
                                backgroundColor: colors.primary,
                                elevation: 3,
                                borderRadius: 8,
                                padding: 3,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Icon name="tag" color={colors.icons} size={16} />
                              <Text
                                style={{
                                  color: colors.icons,
                                  fontSize: 16,
                                  paddingHorizontal: 3,
                                }}>
                                {appliedDeliveryVoucherTitle}
                              </Text>
                            </View>
                          </Right>
                        </CardItem>
                      )}

                      <MapCardItem
                        onTouchStart={() =>
                          this.setState({allowDragging: false})
                        }
                        onTouchEnd={() => this.setState({allowDragging: true})}
                        onTouchCancel={() =>
                          this.setState({allowDragging: true})
                        }
                        vehicleType={mrspeedyVehicleType}
                        courierCoordinates={courierCoordinates}
                      />
                    </View>
                  ) : (
                    <PrimaryActivityIndicator />
                  )}
                </Card>
              </View>
              {selectedOrder && orderStatus[0] === 'CANCELLED' && (
                <View
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                  }}>
                  <Card
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <CardItemHeader title="Order Cancellation Details" />

                    <CardItem>
                      <Left>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Cancelled By:
                        </Text>
                      </Left>

                      <Right>
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'right',
                          }}>
                          {selectedOrder.orderStatus.cancelled.byShopper
                            ? `${userName} (Shopper)`
                            : `${selectedOrder?.storeName} (Store)`}
                        </Text>
                      </Right>
                    </CardItem>

                    <CardItem>
                      <Left>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Bold',
                          }}>
                          Reason:
                        </Text>
                      </Left>

                      <Right>
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'right',
                          }}>
                          {cancelReason}
                        </Text>
                      </Right>
                    </CardItem>
                  </Card>
                </View>
              )}

              {selectedOrder?.paymentMethod === 'Online Banking' &&
                !selectedOrder.orderStatus.pending.status &&
                !selectedOrder.orderStatus.cancelled.status && (
                  <View
                    style={{
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                    }}>
                    <Card
                      style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}>
                      <CardItem
                        header
                        bordered
                        style={{
                          backgroundColor: colors.primary,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          height: 60,
                          paddingBottom: 0,
                          paddingTop: 0,
                        }}>
                        <Text style={{color: colors.icons, fontSize: 20}}>
                          Payment Details
                        </Text>

                        {orderStatus[0] === 'UNPAID' &&
                          selectedOrder?.paymentMethod === 'Online Banking' &&
                          selectedOrder?.paymentLink && (
                            <Button
                              title="Pay Now"
                              onPress={() => this.openPaymentLink()}
                              titleStyle={{color: colors.icons}}
                              buttonStyle={{
                                backgroundColor: colors.accent,
                              }}
                              containerStyle={{borderRadius: 24}}
                            />
                          )}
                      </CardItem>

                      {orderPayment ? (
                        <View>
                          <CardItem bordered>
                            <Left>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Payment Processor:
                              </Text>
                            </Left>

                            <Right>
                              <Text
                                style={{
                                  fontSize: 16,
                                  textAlign: 'right',
                                }}>
                                {paymentGateway.longName}
                              </Text>
                            </Right>
                          </CardItem>

                          <CardItem bordered>
                            <Left>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Payment Status:
                              </Text>
                            </Left>

                            <Right>
                              <Text
                                style={{
                                  color: colors.primary,
                                  fontSize: 16,
                                  textAlign: 'right',
                                }}>
                                {paymentStatus}
                              </Text>
                            </Right>
                          </CardItem>

                          <CardItem bordered>
                            <Left>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Payment Description:
                              </Text>
                            </Left>

                            <Right>
                              <Text
                                style={{
                                  fontSize: 16,
                                  textAlign: 'right',
                                }}>
                                {orderPayment.description}
                              </Text>
                            </Right>
                          </CardItem>

                          <CardItem bordered>
                            <Left>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'ProductSans-Bold',
                                }}>
                                Payment Amount:
                              </Text>
                            </Left>

                            <Right>
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: colors.primary,
                                  fontFamily: 'ProductSans-Black',
                                }}>
                                ₱{orderPayment.paymentAmount}
                              </Text>
                            </Right>
                          </CardItem>

                          {paymentGateway && (
                            <CardItem bordered>
                              <Left>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'ProductSans-Bold',
                                  }}>
                                  Payment Gateway:
                                </Text>
                              </Left>

                              <Right>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    textAlign: 'right',
                                  }}>
                                  {paymentGateway.longName}
                                </Text>
                              </Right>
                            </CardItem>
                          )}
                        </View>
                      ) : (
                        <PrimaryActivityIndicator />
                      )}
                    </Card>
                  </View>
                )}

              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                }}>
                <Card
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                  <CardItemHeader title="Order Summary" />

                  {itemsReady ? (
                    <View>
                      {orderItems.map((item, index) => {
                        return (
                          <View key={item.itemId}>
                            <CartListItem
                              item={item}
                              storeId={selectedOrder?.storeId}
                              checkout
                            />
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <PrimaryActivityIndicator />
                  )}

                  <Divider />

                  <CardItem bordered>
                    <View style={{flex: 1}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 16,
                            textAlign: 'left',
                          }}>
                          {'Subtotal: '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          ₱{selectedOrder?.subTotal.toFixed(2)}
                        </Text>
                      </View>

                      {selectedOrder?.deliveryDiscount && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 16,
                              textAlign: 'left',
                            }}>
                            {'Store Delivery Discount: '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Black',
                            }}>
                            -₱{selectedOrder.deliveryDiscount.toFixed(2)}
                          </Text>
                        </View>
                      )}

                      {appliedDeliveryVoucherAmount && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 16,
                              textAlign: 'left',
                            }}>
                            {'Marketeer Voucher Delivery Discount: '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'ProductSans-Black',
                            }}>
                            -₱{appliedDeliveryVoucherAmount.toFixed(2)}
                          </Text>
                        </View>
                      )}

                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              fontSize: 16,
                              textAlign: 'left',
                            }}>
                            {'Total Delivery Price: '}
                          </Text>

                          {!selectedOrder?.deliveryPrice && (
                            <Text
                              style={{
                                flex: 1,
                                fontSize: 12,
                                color: colors.text_secondary,
                                textAlign: 'left',
                              }}>
                              Delivery price will be shown once the store has
                              shipped order
                            </Text>
                          )}
                        </View>

                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          {selectedOrder?.deliveryPrice
                            ? `₱${finalDeliveryPrice.toFixed(2)}`
                            : 'TBD'}
                        </Text>
                      </View>
                    </View>
                  </CardItem>
                  <CardItem footer bordered>
                    <Left>
                      <View style={{flex: 1}}>
                        <Text style={{color: colors.text_secondary}}>
                          {selectedOrder?.quantity} items
                        </Text>
                      </View>
                    </Left>
                    <Right>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Light',
                            textAlign: 'left',
                          }}>
                          {'Order Total: '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          {`₱${totalAmount.toFixed(2)}`}
                        </Text>
                      </View>
                    </Right>
                  </CardItem>
                </Card>
              </View>
            </ScrollView>
          </View>
        ) : (
          <PrimaryActivityIndicator style={{flex: 1}} />
        )}
      </View>
    );
  }
}

export default OrderDetailsScreen;
