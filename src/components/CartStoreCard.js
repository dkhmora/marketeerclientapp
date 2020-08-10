import React, {Component} from 'react';
import {View, ActivityIndicator, Platform} from 'react-native';
import {Picker} from 'native-base';
import {Card, Text, Image, Icon} from 'react-native-elements';
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

  @observable storeDetails = {};

  @computed get orderTotal() {
    if (this.storeDetails) {
      const {ownDeliveryServiceFee} = this.storeDetails;

      return this.props.shopStore.storeSelectedDeliveryMethod[
        this.props.merchantId
      ] === 'Own Delivery'
        ? this.subTotal + ownDeliveryServiceFee
        : this.subTotal;
    }

    return null;
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

  async getImage() {
    const {merchantId} = this.props;

    const ref = storage().ref(`/images/merchants/${merchantId}/display.jpg`);
    const link = await ref.getDownloadURL();
    this.url = {uri: link};
  }

  async getStoreDetails() {
    this.storeDetails = await this.props.shopStore.getStoreDetailsFromMerchantId(
      this.props.merchantId,
    );
  }

  async getStoreItemsSnapshot() {
    this.props.shopStore.setStoreItems(
      this.props.merchantId,
      this.storeDetails.itemCategories,
    );
  }

  async componentDidMount() {
    const {checkout} = this.props;

    this.getImage();

    await this.getStoreDetails();

    if (this.props.cart) {
      this.getStoreItemsSnapshot();
    }

    if (checkout) {
      when(
        () =>
          this.storeDetails.deliveryMethods &&
          this.storeDetails.deliveryMethods.length > 0 &&
          this.storeDetails.paymentMethods &&
          this.storeDetails.paymentMethods.length > 0,
        () => {
          if (this.storeDetails.deliveryMethods.includes('Own Delivery')) {
            this.props.shopStore.storeSelectedDeliveryMethod[
              this.props.merchantId
            ] = 'Own Delivery';
          } else {
            this.props.shopStore.storeSelectedDeliveryMethod[
              this.props.merchantId
            ] = this.storeDetails.deliveryMethods[0];
          }

          this.props.shopStore.storeSelectedPaymentMethod[
            this.props.merchantId
          ] = this.storeDetails.paymentMethods[0];
        },
      );
    }
  }

  componentWillUnmount() {
    this.props.shopStore.storeSelectedDeliveryMethod = {};
    this.props.shopStore.storeSelectedPaymentMethod = {};
  }

  render() {
    const {merchantId, checkout} = this.props;
    const {storeName} = this;

    return (
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
                height: 40,
                width: 40,
                marginRight: 10,
                borderRadius: 10,
                borderColor: colors.primary,
                borderWidth: 1,
              }}
            />

            <Text
              numberOfLines={3}
              style={{
                fontSize: 19,
                fontFamily: 'ProductSans-Light',
                maxWidth: '50%',
                flexWrap: 'wrap',
              }}>
              {storeName}
            </Text>

            {this.storeDetails.freeDelivery && (
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                style={{
                  fontSize: 16,
                  fontFamily: 'ProductSans-Bold',
                  flexShrink: 1,
                  color: colors.primary,
                  marginLeft: 10,
                }}>
                Free Delivery (₱{this.storeDetails.freeDeliveryMinimum} Min.
                Order)
              </Text>
            )}
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
                Order Subtotal
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
                  <Text
                    style={{fontSize: 17, fontFamily: 'ProductSans-Regular'}}>
                    Delivery Fee
                  </Text>
                </View>

                {this.props.shopStore.storeSelectedDeliveryMethod[
                  merchantId
                ] === 'Own Delivery' && this.storeDetails ? (
                  <Text
                    style={{
                      fontFamily: 'ProductSans-Black',
                      fontSize: 18,
                      textAlignVertical: 'center',
                      color:
                        this.subTotal >=
                          this.storeDetails.freeDeliveryMinimum &&
                        this.storeDetails.freeDelivery
                          ? colors.primary
                          : colors.text_primary,
                    }}>
                    {this.subTotal >= this.storeDetails.freeDeliveryMinimum &&
                    this.storeDetails.freeDelivery
                      ? 'Free Delivery'
                      : `₱${this.storeDetails.ownDeliveryServiceFee}`}
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontFamily: 'ProductSans-Black',
                      fontSize: 14,
                      textAlignVertical: 'center',
                    }}>
                    (Please discuss with merchant)
                  </Text>
                )}
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

          {this.storeDetails ? (
            checkout && (
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
                      flex: Platform.OS === 'ios' ? 1 : 0,
                    }}>
                    Delivery Method:
                  </Text>

                  {this.storeDetails.deliveryMethods &&
                  this.storeDetails.deliveryMethods.length > 0 ? (
                    <Picker
                      mode="dropdown"
                      iosIcon={<Icon name="chevron-down" />}
                      selectedValue={
                        this.props.shopStore.storeSelectedDeliveryMethod[
                          merchantId
                        ]
                      }
                      onValueChange={(value) => {
                        this.props.shopStore.storeSelectedDeliveryMethod[
                          merchantId
                        ] = value;
                      }}>
                      {this.storeDetails.deliveryMethods &&
                        this.storeDetails.deliveryMethods.map(
                          (method, index) => {
                            const label =
                              method === 'Own Delivery'
                                ? `${method} (₱ ${this.storeDetails.ownDeliveryServiceFee})`
                                : `${method}`;

                            return (
                              <Picker.Item
                                label={label}
                                value={method}
                                key={`${method}${index}`}
                              />
                            );
                          },
                        )}
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
                      No delivery method available
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
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'ProductSans-Light',
                      flex: Platform.OS === 'ios' ? 1 : 0,
                    }}>
                    Payment Method:
                  </Text>
                  {this.storeDetails.paymentMethods &&
                  this.storeDetails.paymentMethods.length > 0 ? (
                    <Picker
                      mode="dropdown"
                      style={{flex: 1}}
                      iosIcon={<Icon name="chevron-down" />}
                      selectedValue={
                        this.props.shopStore.storeSelectedPaymentMethod[
                          merchantId
                        ]
                      }
                      onValueChange={(value) => {
                        this.props.shopStore.storeSelectedPaymentMethod[
                          merchantId
                        ] = value;
                      }}>
                      {this.storeDetails.paymentMethods &&
                        this.storeDetails.paymentMethods.map(
                          (method, index) => {
                            return (
                              <Picker.Item
                                label={method}
                                value={method}
                                key={`${method}${index}`}
                              />
                            );
                          },
                        )}
                    </Picker>
                  ) : (
                    <Text style={{paddingTop: 10}}>
                      No payment method available
                    </Text>
                  )}
                </View>
              </View>
            )
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.divider,
                marginHorizontal: 10,
                marginTop: 10,
              }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </Card>
      </View>
    );
  }
}

export default CartStoreCard;
