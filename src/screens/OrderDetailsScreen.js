import React, {Component} from 'react';
import {
  Container,
  Card,
  CardItem,
  Left,
  Right,
  Body,
  Button,
  Icon,
} from 'native-base';
import {View, Platform, Linking} from 'react-native';
import {Text} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../assets/colors';
import CartListItem from '../components/CartListItem';

class OrderDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  openInMaps() {
    const {coordinates, userName} = this.props.route.params;
    const markerName = `Customer ${userName}'s Location`;

    const latLng = `${coordinates._latitude},${coordinates._longitude}`;
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${markerName}&ll=${latLng}`,
      android: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });

    Linking.openURL(url);
  }

  render() {
    const {
      coordinates,
      orderId,
      orderItems,
      userName,
      orderNumber,
      orderStatus,
      quantity,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props.route.params;
    const {navigation} = this.props;

    const cancelReason = orderStatus.cancelled.reason;

    const mapButtonText =
      Platform.OS === 'ios' ? 'Open in Apple Maps' : 'Open in Google Maps';

    const actions = [
      {
        name: 'Accept Order',
        action: 'navigation.navigate("Order List")',
      },
    ];

    return (
      <View style={{flex: 1}}>
        <BaseHeader
          title={`Order #${orderNumber} Details`}
          backButton
          optionsButton
          actions={actions}
          navigation={navigation}
        />

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 6,
            marginVertical: 3,
          }}>
          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <FlatList
              ListHeaderComponent={
                <CardItem
                  header
                  bordered
                  style={{backgroundColor: colors.primary}}>
                  <Text style={{color: colors.icons, fontSize: 20}}>
                    Order Items
                  </Text>
                </CardItem>
              }
              data={orderItems}
              renderItem={({item, index}) => (
                <View style={{marginHorizontal: 15}}>
                  <CartListItem item={item} />
                </View>
              )}
              keyExtractor={(item, index) => `${item.name}${index.toString()}`}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <View
                  style={{
                    height: 0.5,
                    flex: 1,
                    backgroundColor: colors.divider,
                  }}
                />
              }
            />
            <CardItem bordered>
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
                      color: colors.primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    ₱{totalAmount}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Light',
                    }}>
                    Estimated Shipping Price:{' '}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    ₱{shippingPrice}130-200
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
                    ₱{totalAmount + 130} - ₱{totalAmount + 200}
                  </Text>
                </View>
              </Right>
            </CardItem>
          </Card>
          {orderStatus.cancelled.status && (
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
          )}
        </View>
      </View>
    );
  }
}

export default OrderDetailsScreen;
