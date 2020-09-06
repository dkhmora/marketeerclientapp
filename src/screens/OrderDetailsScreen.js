import React, {Component} from 'react';
import {Card, CardItem, Left, Right} from 'native-base';
import {View, ActivityIndicator, Linking} from 'react-native';
import {Text, Input, Icon, Button} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import CartListItem from '../components/CartListItem';
import {inject, observer} from 'mobx-react';
import ConfirmationModal from '../components/ConfirmationModal';
import * as Animatable from 'react-native-animatable';
import Toast from '../components/Toast';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {computed} from 'mobx';
import PrimaryActivityIndicator from '../components/PrimaryActivityIndicator';

@inject('generalStore')
@inject('authStore')
@observer
class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);

    const {order, orderId} = this.props.route.params;

    this.state = {
      order: {...order},
      orderItems: null,
      orderPayment: null,
      ready: false,
      confirmCancelOrderModal: false,
      cancelReasonCheck: false,
      cancelReasonInput: '',
      cancelOrderLoading: false,
    };

    if (order) {
      this.props.generalStore
        .getOrderItems(order.orderId)
        .then((orderItems) => {
          this.setState({orderItems, ready: true});
        });
    }

    if (orderId && !order) {
      this.props.generalStore.getOrder(orderId).then(() => {
        this.props.generalStore.getOrderItems(orderId).then((orderDetails) => {
          this.setState({order: {...orderDetails, orderId}, ready: true});
        });
      });
    }
  }

  componentDidMount() {
    const {order} = this.props.route.params;
    const {availablePaymentMethods} = this.props.generalStore;

    if (order.paymentMethod === 'Online Banking') {
      if (Object.keys(availablePaymentMethods).length === 0) {
        this.props.generalStore.setAppData();
      }

      if (
        !order.orderStatus.pending.status &&
        !order.orderStatus.cancelled.status
      ) {
        this.props.generalStore
          .getOrderPayment(order.orderId)
          .then((orderPayment) => {
            this.setState({orderPayment, ready: true});
          });
      }
    }
  }

  @computed get orderStatus() {
    const {orderStatus} = this.state.order;

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
    const {order} = this.props.route.params;
    const {userOrderNumber} = order;

    this.setState({cancelOrderLoading: true}, () => {
      this.props.generalStore
        .cancelOrder(
          this.props.route.params.order.orderId,
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
        Linking.openURL(url);
      }
      this.props.generalStore.appReady = true;
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  render() {
    const {
      orderItems,
      orderPayment,
      ready,
      confirmCancelOrderModal,
      cancelReasonCheck,
      cancelReasonInput,
      cancelOrderLoading,
      order,
    } = this.state;
    const {orderStatus} = this;
    const {availablePaymentMethods} = this.props.generalStore;
    const {
      userOrderNumber,
      quantity,
      deliveryPrice,
      subTotal,
      paymentMethod,
      deliveryMethod,
      storeName,
      storeId,
      processId,
      paymentLink,
      orderId,
    } = order;
    const paymentGateway = processId
      ? availablePaymentMethods[processId]
      : null;
    const {userName} = this.props.authStore;
    const {navigation} = this.props;
    const cancelReason = order.orderStatus.cancelled.reason;

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
          title={userOrderNumber && `Order #${userOrderNumber} Details`}
          centerComponent={
            !userOrderNumber && (
              <ActivityIndicator size="small" color={colors.icons} />
            )
          }
          backButton
          optionsIcon="help-circle"
          options={
            orderStatus[0] === 'PENDING' ||
            orderStatus[0] === 'UNPAID' ||
            (orderStatus[0] === 'PAID' && paymentMethod === 'COD')
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

        {order ? (
          <View style={{flex: 1}}>
            <ConfirmationModal
              isVisible={confirmCancelOrderModal}
              closeModal={() => this.closeModal()}
              title={`Cancel Order #${userOrderNumber}`}
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
                  <CardItem
                    header
                    bordered
                    style={{backgroundColor: colors.primary}}>
                    <Text style={{color: colors.icons, fontSize: 20}}>
                      Order Details
                    </Text>
                  </CardItem>

                  <CardItem bordered>
                    <Left>
                      <Text
                        style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                        Order #:
                      </Text>
                    </Left>

                    <Right>
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: 16,
                          textAlign: 'right',
                        }}>
                        {orderId}
                      </Text>
                    </Right>
                  </CardItem>

                  <CardItem bordered>
                    <Left>
                      <Text
                        style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                        {orderStatus[0] !== 'PAID' ? orderStatus : 'PROCESSING'}
                      </Text>
                    </Right>
                  </CardItem>

                  <CardItem bordered>
                    <Left>
                      <Text
                        style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                        Delivery Method:
                      </Text>
                    </Left>

                    <Right>
                      <Text
                        style={{
                          color: colors.text_primary,
                          fontSize: 16,
                          textAlign: 'right',
                        }}>
                        {deliveryMethod}
                      </Text>
                    </Right>
                  </CardItem>
                </Card>
              </View>
              {orderStatus[0] === 'CANCELLED' && (
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
                          {order.orderStatus.cancelled.byShopper
                            ? `${userName} (Shopper)`
                            : `${storeName} (Store)`}
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

                  {ready ? (
                    <View>
                      {orderItems.map((item, index) => {
                        return (
                          <View key={item.itemId}>
                            <CartListItem
                              item={item}
                              storeId={storeId}
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
                      <Text note>{quantity} items</Text>
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
                          ₱{subTotal}
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
                          Delivery Price:{' '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            color: colors.text_primary,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          {deliveryPrice && deliveryPrice > 0
                            ? `₱${deliveryPrice}`
                            : deliveryPrice === null
                            ? '(Contact Store)'
                            : '₱0 (Free Delivery)'}
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
                          Order Total:{' '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            color: colors.primary,
                            fontFamily: 'ProductSans-Black',
                          }}>
                          ₱{subTotal + (deliveryPrice ? deliveryPrice : 0)}
                        </Text>
                      </View>
                    </Right>
                  </CardItem>
                </Card>
              </View>

              {paymentMethod === 'Online Banking' &&
                !order.orderStatus.pending.status &&
                !order.orderStatus.cancelled.status && (
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
                          paymentMethod === 'Online Banking' &&
                          paymentLink && (
                            <Button
                              title="Pay Now"
                              onPress={() => {
                                this.props.generalStore.appReady = false;
                                this.openLink(paymentLink);
                              }}
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
