import React, {Component} from 'react';
import {Card, CardItem, Left, Right, Body} from 'native-base';
import {View, ActivityIndicator} from 'react-native';
import {Text, Input, Icon} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import CartListItem from '../components/CartListItem';
import {inject, observer} from 'mobx-react';
import ConfirmationModal from '../components/ConfirmationModal';
import * as Animatable from 'react-native-animatable';
import Toast from '../components/Toast';

@inject('generalStore')
@inject('authStore')
@observer
class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);

    const {orderId} = this.props.route.params.order;

    this.state = {
      orderItems: null,
      ready: false,
      confirmCancelOrderModal: false,
      cancelReasonCheck: false,
      cancelReasonInput: '',
      cancelOrderLoading: false,
    };

    this.props.generalStore.getOrderItems(orderId).then((orderItems) => {
      this.setState({orderItems, ready: true});
    });
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

  render() {
    const {order, orderStatus} = this.props.route.params;
    const {
      userOrderNumber,
      quantity,
      deliveryPrice,
      subTotal,
      paymentMethod,
      deliveryMethod,
      storeName,
    } = order;
    const {userName} = this.props.authStore;

    const {navigation} = this.props;

    const {
      orderItems,
      ready,
      confirmCancelOrderModal,
      cancelReasonCheck,
      cancelReasonInput,
      cancelOrderLoading,
    } = this.state;

    const cancelReason = order.orderStatus.cancelled.reason;

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={`Order #${userOrderNumber} Details`}
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
                onChangeText={(value) => this.handleCancelReasonChange(value)}
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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

              <CardItem bordered>
                <Left>
                  <Text style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
                    Payment Method:
                  </Text>
                </Left>

                <Right>
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontSize: 16,
                      textAlign: 'right',
                    }}>
                    {paymentMethod}
                  </Text>
                </Right>
              </CardItem>
            </Card>
          </View>

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
                        <CartListItem item={item} checkout />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 15,
                  }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
              <CardItem
                bordered
                style={{borderTopWidth: 0.5, borderTopColor: colors.divider}}>
                <Left>
                  <Text note>{quantity} items</Text>
                </Left>
                <Right>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
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

                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                      style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
                      style={{fontSize: 16, fontFamily: 'ProductSans-Bold'}}>
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
        </ScrollView>
      </View>
    );
  }
}

export default OrderDetailsScreen;
