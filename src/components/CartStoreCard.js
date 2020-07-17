import React, {Component} from 'react';
import {View} from 'react-native';
import {Picker} from 'native-base';
import {Card, Text, Image} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import CartListItem from './CartListItem';
import {colors} from '../../assets/colors';
import storage from '@react-native-firebase/storage';
import {observable, computed} from 'mobx';

@inject('generalStore')
@inject('shopStore')
@observer
class CartStoreCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  @observable storeDetails = this.props.shopStore.getStoreDetails(
    this.props.merchantId,
  );

  @computed get subTotal() {
    let amount = 0;

    if (this.cartItems) {
      this.cartItems.map((item) => {
        const itemTotal = item.quantity * item.price;

        amount = itemTotal + amount;
      });
    }

    return amount;
  }

  @computed get totalItemQuantity() {
    let quantity = 0;

    if (this.cartItems) {
      this.cartItems.map((item) => {
        quantity = item.quantity + quantity;
      });
    }

    return quantity;
  }

  @computed get cartItems() {
    return this.props.shopStore.storeCartItems[this.props.merchantId];
  }

  @computed get storeName() {
    const {merchantId} = this.props;

    return this.props.shopStore.storeList.find(
      (item) => item.merchantId === merchantId,
    ).storeName;
  }

  getImage = async (imageRef) => {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();
    this.url = {uri: link};
  };

  componentDidMount() {
    const {displayImage} = this.storeDetails;

    if (displayImage) {
      this.getImage(displayImage);
    } else {
      this.url = require('../../assets/images/placeholder.jpg');
    }

    this.props.shopStore.storeSelectedShipping[
      this.props.merchantId
    ] = this.storeDetails.shippingMethods[0];

    this.props.shopStore.storeSelectedPaymentMethod[
      this.props.merchantId
    ] = this.storeDetails.paymentMethods[0];
  }

  render() {
    const {merchantId, checkout} = this.props;
    const {shippingMethods, paymentMethods} = this.storeDetails;
    const {storeName} = this;

    return (
      <Card
        containerStyle={{
          margin: 3,
          marginVertical: 10,
          borderRadius: 10,
          elevation: 3,
          overflow: 'hidden',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 5,
            borderBottomWidth: 1,
            borderBottomColor: colors.primary,
          }}>
          <Image
            source={this.url}
            style={{
              height: 30,
              width: 30,
              marginRight: 10,
              borderRadius: 10,
              borderColor: colors.primary,
              borderWidth: 1,
            }}
          />

          <Text
            numberOfLines={2}
            style={{
              width: '85%',
              fontSize: 20,
              fontFamily: 'ProductSans-Light',
              flexWrap: 'wrap',
            }}>
            {storeName}
          </Text>
        </View>
        <View>
          {this.cartItems.map((item) => {
            return (
              <View key={item.name} style={{flex: 1, alignItems: 'center'}}>
                <CartListItem item={item} />
                <View
                  style={{
                    width: '100%',
                    height: 1,
                    backgroundColor: colors.divider,
                  }}
                />
              </View>
            );
          })}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 17, fontFamily: 'ProductSans-Regular'}}>
              Store Subtotal
            </Text>
            <Text style={{fontSize: 13, paddingLeft: 5}}>
              ({this.totalItemQuantity} Items)
            </Text>
          </View>
          <Text style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
            ₱ {this.subTotal}
          </Text>
        </View>

        {checkout && (
          <View
            style={{
              flex: 1,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.divider,
              paddingHorizontal: 8,
              flexDirection: 'column',
            }}>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{fontSize: 16, fontFamily: 'ProductSans-Light'}}>
                Shipping Method:
              </Text>
              <Picker
                mode="dropdown"
                style={{flex: 1}}
                selectedValue={
                  this.props.shopStore.storeSelectedShipping[merchantId]
                }
                onValueChange={(value) => {
                  this.props.shopStore.storeSelectedShipping[
                    merchantId
                  ] = value;
                }}>
                {shippingMethods.length > 0 ? (
                  shippingMethods.map((method, index) => {
                    return (
                      <Picker.Item label={method} value={method} key={index} />
                    );
                  })
                ) : (
                  <Text>No shipping method available for your location</Text>
                )}
              </Picker>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{fontSize: 16, fontFamily: 'ProductSans-Light'}}>
                Payment Method:
              </Text>
              <Picker
                mode="dropdown"
                style={{flex: 1}}
                selectedValue={
                  this.props.shopStore.storeSelectedPaymentMethod[merchantId]
                }
                onValueChange={(value) => {
                  this.props.shopStore.storeSelectedPaymentMethod[
                    merchantId
                  ] = value;
                }}>
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method, index) => {
                    return (
                      <Picker.Item label={method} value={method} key={index} />
                    );
                  })
                ) : (
                  <Text>No payment method available</Text>
                )}
              </Picker>
            </View>
          </View>
        )}
      </Card>
    );
  }
}

export default CartStoreCard;
