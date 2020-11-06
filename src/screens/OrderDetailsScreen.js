import React, {Component} from 'react';
import {Card, CardItem, Left, Right} from 'native-base';
import {View, ActivityIndicator, Linking} from 'react-native';
import {Text, Input, Icon, Button, Badge, Image} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import CartListItem from '../components/CartListItem';
import {inject, observer} from 'mobx-react';
import ConfirmationModal from '../components/ConfirmationModal';
import * as Animatable from 'react-native-animatable';
import Toast from '../components/Toast';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {computed, when} from 'mobx';
import PrimaryActivityIndicator from '../components/PrimaryActivityIndicator';
import crashlytics from '@react-native-firebase/crashlytics';
import MapCardItem from '../components/MapCardItem';
import CardItemHeader from '../components/CardItemHeader';

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

    this.props.generalStore.getOrderItems(orderId).then((orderItems) => {
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
          await this.props.generalStore
            .getOrderPayment(orderId)
            .then((orderPayment) => {
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

    return 'N/A';
  }

  @computed get orderTotalText() {
    const {selectedOrder} = this.props.generalStore;

    if (selectedOrder) {
      const {
        deliveryPrice,
        deliveryMethod,
        mrspeedyBookingData,
        subTotal,
      } = selectedOrder;

      if (deliveryPrice) {
        if (deliveryPrice > 0) {
          return `₱${(subTotal + deliveryPrice).toFixed(2)}`;
        }
      }

      if (deliveryMethod === 'Mr. Speedy') {
        if (mrspeedyBookingData) {
          const {estimatedOrderPrices} = mrspeedyBookingData;

          if (estimatedOrderPrices) {
            return `₱${(subTotal + estimatedOrderPrices.motorbike).toFixed(
              2,
            )} - ₱${(subTotal + estimatedOrderPrices.car).toFixed(2)}`;
          }
        }

        return 'To be determined once order is shipped';
      }
    }

    return 'N/A';
  }

  @computed get mrspeedyVehicleType() {
    const {selectedOrder} = this.props.generalStore;

    if (
      selectedOrder.mrspeedyBookingData &&
      selectedOrder.mrspeedyBookingData.order
    ) {
      return selectedOrder.mrspeedyBookingData.order.vehicle_type_id === 8
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
      this.props.generalStore
        .cancelOrder(
          this.props.route.params.orderId,
          this.state.cancelReasonInput,
        )
        .then((response) => {
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

  async openLink(url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          dismissButtonStyle: 'close',
          preferredBarTintColor: colors.primary,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'pageSheet',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: colors.primary,
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });
      } else {
        await Linking.openURL(url);
      }
      this.setState({paymentProcessing: false});
      this.props.generalStore.appReady = true;
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  openPaymentLink() {
    this.props.generalStore.appReady = false;
    this.setState({orderPayment: null, paymentProcessing: true}, () => {
      this.openLink(this.props.generalStore.selectedOrder.paymentLink);
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
      itemsReady,
      orderItems,
      orderPayment,
      confirmCancelOrderModal,
      cancelReasonCheck,
      cancelReasonInput,
      cancelOrderLoading,
      courierCoordinates,
      allowDragging,
    } = this.state;
    const {orderStatus} = this;
    const {availablePaymentMethods, selectedOrder} = this.props.generalStore;
    const paymentGateway =
      selectedOrder && selectedOrder.processId
        ? availablePaymentMethods[selectedOrder.processId]
        : null;
    const {userName} = this.props.authStore;
    const {navigation} = this.props;

    const cancelReason = selectedOrder
      ? selectedOrder.orderStatus.cancelled.reason
      : null;

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

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={
            selectedOrder
              ? selectedOrder.userOrderNumber &&
                `Order #${selectedOrder.userOrderNumber} Details`
              : null
          }
          centerComponent={
            selectedOrder
              ? !selectedOrder.userOrderNumber && (
                  <ActivityIndicator size="small" color={colors.icons} />
                )
              : null
          }
          backButton
          optionsIcon="help-circle"
          options={
            orderStatus &&
            (orderStatus[0] === 'PENDING' ||
              orderStatus[0] === 'UNPAID' ||
              (orderStatus[0] === 'PAID' &&
                selectedOrder.paymentMethod === 'COD'))
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
              closeModal={() => this.closeModal()}
              title={`Cancel Order #${selectedOrder.userOrderNumber}`}
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

                            {selectedOrder.userUnreadCount !== null &&
                              selectedOrder.userUnreadCount > 0 && (
                                <Badge
                                  value={selectedOrder.userUnreadCount}
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
                              color: colors.text_primary,
                              fontSize: 16,
                              textAlign: 'right',
                            }}>
                            {selectedOrder.orderId}
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
                          {selectedOrder.deliveryMethod === 'Mr. Speedy' ? (
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
                                color: colors.text_primary,
                                fontSize: 16,
                                textAlign: 'right',
                              }}>
                              {selectedOrder.deliveryMethod}
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
                          <View
                            style={{
                              borderRadius: 20,
                              backgroundColor: colors.accent,
                              padding: 3,
                              paddingHorizontal: 10,
                              marginLeft: 2,
                            }}>
                            <Text
                              style={{
                                fontSize: 13,
                                fontFamily: 'ProductSans-Regular',
                                color: colors.icons,
                              }}>
                              {selectedOrder.paymentMethod}
                            </Text>
                          </View>
                        </Right>
                      </CardItem>

                      <MapCardItem
                        onTouchStart={() =>
                          this.setState({allowDragging: false})
                        }
                        onTouchEnd={() => this.setState({allowDragging: true})}
                        onTouchCancel={() =>
                          this.setState({allowDragging: true})
                        }
                        vehicleType={this.mrspeedyVehicleType}
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
                    <CardItem
                      header
                      bordered
                      style={{backgroundColor: colors.primary}}>
                      <Text style={{color: colors.icons, fontSize: 20}}>
                        Order Cancellation Details
                      </Text>
                    </CardItem>

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
                            color: colors.text_primary,
                            fontSize: 16,
                            textAlign: 'right',
                          }}>
                          {selectedOrder.orderStatus.cancelled.byShopper
                            ? `${userName} (Shopper)`
                            : `${selectedOrder.storeName} (Store)`}
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
                            color: colors.text_primary,
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

              {selectedOrder.paymentMethod === 'Online Banking' &&
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
                          selectedOrder.paymentMethod === 'Online Banking' &&
                          selectedOrder.paymentLink && (
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
                                  color: colors.text_primary,
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
                                  color: colors.text_primary,
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
                                  fontSize: 18,
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
                                    color: colors.text_primary,
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
                  <CardItem
                    header
                    bordered
                    style={{backgroundColor: colors.primary}}>
                    <Text style={{color: colors.icons, fontSize: 20}}>
                      Order Items
                    </Text>
                  </CardItem>

                  {itemsReady ? (
                    <View>
                      {orderItems.map((item, index) => {
                        return (
                          <View key={item.itemId}>
                            <CartListItem
                              item={item}
                              storeId={selectedOrder.storeId}
                              checkout
                            />
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <PrimaryActivityIndicator />
                  )}
                  <CardItem
                    bordered
                    style={{
                      borderTopWidth: 0.5,
                      borderTopColor: colors.divider,
                    }}>
                    <Left>
                      <Text note>{selectedOrder.quantity} items</Text>
                    </Left>
                    <Right>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={{
                            fontSize: 15,
                            color: colors.text_primary,
                            fontFamily: 'ProductSans-Light',
                          }}>
                          Subtotal:{' '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            color: colors.text_primary,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          ₱{selectedOrder.subTotal}
                        </Text>
                      </View>

                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={{
                            fontSize: 15,
                            color: colors.text_primary,
                            fontFamily: 'ProductSans-Light',
                          }}>
                          {'Delivery Price: '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            color: colors.text_primary,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          {this.deliveryPriceText}
                        </Text>
                      </View>
                    </Right>
                  </CardItem>
                  <CardItem footer bordered>
                    <Left />
                    <Right>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={{
                            fontSize: 15,
                            color: colors.text_primary,
                            fontFamily: 'ProductSans-Light',
                          }}>
                          {'Order Total: '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            color: colors.primary,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          {this.orderTotalText}
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
