import React, {Component} from 'react';
import {View, Picker} from 'react-native';
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
    return this.props.shopStore.storeCartItems[this.props.storeName];
  }

  getImage = async (imageRef) => {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();
    this.url = {uri: link};
  };

  componentDidMount() {
    const {storeName} = this.props;
    const storeDetails = this.props.shopStore.getStoreDetails(storeName);
    const displayImage = storeDetails.displayImage;

    if (displayImage) {
      this.getImage(displayImage);
    } else {
      this.url = require('../../assets/images/placeholder.jpg');
    }
  }

  render() {
    const {storeName, checkout} = this.props;

    return (
      <Card
        containerStyle={{
          margin: 3,
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
              flexDirection: 'row',
              marginTop: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.divider,
              paddingHorizontal: 8,
            }}>
            <Text style={{fontSize: 16, fontFamily: 'ProductSans-Light'}}>
              Shipping Method:
            </Text>
            <Picker mode="dropdown" style={{flex: 1}}>
              <Picker.Item label="Grab (₱150-₱250)" value="Grab" />
              <Picker.Item label="Lalamove (₱100-₱200)" value="Lalamove" />
              <Picker.Item label="Mr. Speedy (₱80-₱180)" value="Mr. Speedy" />
            </Picker>
          </View>
        )}
      </Card>
    );
  }
}

export default CartStoreCard;
