import React, {Component} from 'react';
import {Card, CardItem, Left, Right, Body} from 'native-base';
import {View, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import CartListItem from '../components/CartListItem';
import {inject, observer} from 'mobx-react';

@inject('generalStore')
@observer
class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);

    const {orderId} = this.props.route.params.order;

    this.state = {
      orderItems: null,
      ready: false,
    };

    this.props.generalStore.getOrderItems(orderId).then((orderItems) => {
      this.setState({orderItems, ready: true});
    });
  }

  render() {
    const {order, orderStatus} = this.props.route.params;
    const {userOrderNumber, quantity, deliveryPrice, subTotal} = order;

    const {navigation} = this.props;

    const {orderItems, ready} = this.state;

    const cancelReason = order.orderStatus.cancelled.reason;

    const actions = [
      {
        name: 'Accept Order',
        action: 'navigation.navigate("Order List")',
      },
    ];

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={`Order #${userOrderNumber} Details`}
          backButton
          optionsButton
          actions={actions}
          navigation={navigation}
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
                    {orderStatus}
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
                    {order.deliveryMethod}
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
                    {order.paymentMethod}
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
                        ? '(Contact Merchant)'
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
                        color: colors.text_primary,
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
                    Reason for Cancellation
                  </Text>
                </CardItem>
                <CardItem>
                  <Body>
                    <Text style={{width: '100%', textAlign: 'justify'}}>
                      {cancelReason}
                    </Text>
                  </Body>
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
