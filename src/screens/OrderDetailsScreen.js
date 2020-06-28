import React, {Component} from 'react';
import {
  Container,
  Card,
  CardItem,
  Text,
  Left,
  Right,
  Body,
  Button,
  Icon,
} from 'native-base';
import {View, Platform, Linking} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import OrderItemCard from '../components/OrderItemCard';
import {colors} from '../../assets/colors';

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
      cancelReason,
      userName,
      orderNumber,
      numberOfItems,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props.route.params;
    const {navigation} = this.props;

    const mapButtonText =
      Platform.OS === 'ios' ? 'Open in Apple Maps' : 'Open in Google Maps';

    const actions = [
      {
        name: 'Accept Order',
        action: 'navigation.navigate("Order List")',
      },
    ];

    return (
      <Container>
        <BaseHeader
          title={`Order #${orderNumber} Details`}
          backButton
          optionsButton
          actions={actions}
          navigation={navigation}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
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
            <CardItem header bordered style={{backgroundColor: colors.primary}}>
              <Text style={{color: '#fff'}}>Order Items</Text>
            </CardItem>
            <FlatList
              data={orderItems}
              renderItem={({item, index}) => (
                <OrderItemCard
                  name={item.name}
                  image={item.image}
                  price={item.price}
                  unit={item.unit}
                  quantity={item.quantity}
                  createdAt={item.createdAt}
                  key={index}
                />
              )}
              keyExtractor={(item, index) => `${item.name}${index.toString()}`}
              showsVerticalScrollIndicator={false}
            />
            <CardItem bordered>
              <Left>
                <Text note>{numberOfItems} items</Text>
              </Left>
              <Right>
                <Text>Subtotal: ₱{totalAmount}</Text>
                <Text>Shipping Price: ₱{shippingPrice}</Text>
              </Right>
            </CardItem>
            <CardItem footer bordered>
              <Left />
              <Right>
                <Text>Order Total: ₱{totalAmount + shippingPrice}</Text>
              </Right>
            </CardItem>
          </Card>

          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <CardItem header bordered style={{backgroundColor: colors.primary}}>
              <Text style={{color: '#fff'}}>Reason for Cancellation</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text style={{width: '100%', textAlign: 'justify'}}>
                  {cancelReason}
                </Text>
              </Body>
            </CardItem>
          </Card>
        </ScrollView>
      </Container>
    );
  }
}

export default OrderDetailsScreen;
