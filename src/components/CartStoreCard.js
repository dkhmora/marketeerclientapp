import React, {Component} from 'react';
import {View} from 'react-native';
import {Picker} from 'native-base';
import {Card, Text, Image} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import CartListItem from './CartListItem';
import {colors} from '../../assets/colors';
import storage from '@react-native-firebase/storage';
import {observable, computed, when} from 'mobx';

@inject('generalStore')
@inject('shopStore')
@observer
class CartStoreCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  @computed get storeDetails() {
    return this.props.shopStore.getStoreDetails(this.props.merchantId);
  }

  @computed get orderTotal() {
    const {ownDeliveryServiceFee} = this.storeDetails;

    return this.props.shopStore.storeSelectedShipping[this.props.merchantId] ===
      'Own Delivery'
      ? this.subTotal + ownDeliveryServiceFee
      : this.subTotal;
  }

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

  @computed get currentStoreItems() {
    const {merchantId} = this.props;
    const storeItems = this.props.shopStore.storeCategoryItems.get(merchantId);

    if (storeItems) {
      return storeItems.get('All');
    }

    return [];
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

    when(
      () =>
        this.storeDetails.shippingMethods &&
        this.storeDetails.shippingMethods.length > 0 &&
        this.storeDetails.paymentMethods &&
        this.storeDetails.paymentMethods.length > 0,
      () => {
        this.props.shopStore.storeSelectedShipping[
          this.props.merchantId
        ] = this.storeDetails.shippingMethods[0];

        this.props.shopStore.storeSelectedPaymentMethod[
          this.props.merchantId
        ] = this.storeDetails.paymentMethods[0];
      },
    );
  }

  render() {
    const {merchantId, checkout} = this.props;
    const {
      shippingMethods,
      paymentMethods,
      ownDeliveryServiceFee,
    } = this.storeDetails;
    const {storeName} = this;

    return (
      <Card
        containerStyle={{
          margin: 0,
          marginVertical: 10,
          paddingLeft: 0,
          paddingRight: 0,
          marginBottom: 10,
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
            paddingHorizontal: 10,
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
            const itemSnapshot = this.currentStoreItems.find(
              (storeItem) => storeItem.itemId === item.itemId,
            );

            return (
              <CartListItem
                item={item}
                itemSnapshot={itemSnapshot}
                merchantId={merchantId}
                checkout={checkout}
                key={item.itemId}
              />
            );
          })}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 10,
            paddingHorizontal: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 17, fontFamily: 'ProductSans-Regular'}}>
              Merchandise Subtotal
            </Text>
            <Text style={{fontSize: 13, paddingLeft: 5}}>
              ({this.totalItemQuantity} Items)
            </Text>
          </View>
          <Text style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
            ₱{this.subTotal}
          </Text>
        </View>

        {checkout && (
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 10,
                paddingHorizontal: 10,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <Text style={{fontSize: 17, fontFamily: 'ProductSans-Regular'}}>
                  Delivery Fee
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: 'ProductSans-Black',
                  fontSize: 14,
                  textAlignVertical: 'center',
                }}>
                {this.props.shopStore.storeSelectedShipping[merchantId] ===
                'Own Delivery'
                  ? `₱${ownDeliveryServiceFee}`
                  : `(To be determined with merchant)`}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 10,
                paddingHorizontal: 10,
              }}>
              <Text style={{fontSize: 17, fontFamily: 'ProductSans-Regular'}}>
                Order Total
              </Text>

              <Text style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
                ₱{this.orderTotal}
              </Text>
            </View>
          </View>
        )}

        {checkout && (
          <View
            style={{
              flex: 1,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.divider,
              marginHorizontal: 10,
              marginTop: 10,
              flexDirection: 'column',
            }}>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 5,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'ProductSans-Light',
                }}>
                Shipping Method:
              </Text>

              {shippingMethods.length > 0 ? (
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
                  {shippingMethods.map((method, index) => {
                    const label =
                      method === 'Own Delivery'
                        ? `${method} (₱ ${ownDeliveryServiceFee})`
                        : `${method}`;

                    return (
                      <Picker.Item label={label} value={method} key={index} />
                    );
                  })}
                </Picker>
              ) : (
                <Text
                  style={{
                    flex: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 18,
                    fontFamily: 'ProductSans-Regular',
                    fontStyle: 'italic',
                  }}>
                  No shipping method available
                </Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 5,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}>
              <Text style={{fontSize: 16, fontFamily: 'ProductSans-Light'}}>
                Payment Method:
              </Text>
              {paymentMethods.length > 0 ? (
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
                  {paymentMethods.map((method, index) => {
                    return (
                      <Picker.Item label={method} value={method} key={index} />
                    );
                  })}
                </Picker>
              ) : (
                <Text style={{paddingTop: 10}}>
                  No payment method available
                </Text>
              )}
            </View>
          </View>
        )}
      </Card>
    );
  }
}

export default CartStoreCard;
