import React, {PureComponent} from 'react';
import {View, ActivityIndicator, Linking, ScrollView} from 'react-native';
import {Card, Text, Image, Icon, ListItem, Input} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import CartListItem from './CartListItem';
import {colors} from '../../assets/colors';
import storage from '@react-native-firebase/storage';
import {observable, computed, when} from 'mobx';
import SelectionModal from './SelectionModal';
import FastImage from 'react-native-fast-image';
import Hyperlink from 'react-native-hyperlink';
import stripHtml from 'string-strip-html';
import Toast from './Toast';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import * as Animatable from 'react-native-animatable';

@inject('generalStore')
@inject('shopStore')
@inject('authStore')
@observer
class CartStoreCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      paymentOptionsModal: false,
      deliveryOptionsModal: false,
      selectedPaymentMethod: null,
      emailCheck: false,
    };
  }

  @observable url = null;

  @observable storeDetails = this.props.shopStore.allStoresMap[
    this.props.storeId
  ];

  @computed get deliveryDiscountApplicable() {
    if (this.storeDetails) {
      const {availableDeliveryMethods, deliveryDiscount} = this.storeDetails;
      const selectedDeliveryMethod = this.props.shopStore
        .storeSelectedDeliveryMethod[this.props.storeId];

      if (
        deliveryDiscount.activated &&
        this.subTotal >= deliveryDiscount.minimumOrderAmount
      ) {
        return true;
      }

      return false;
    }

    return false;
  }

  @computed get deliveryAmount() {
    if (this.storeDetails) {
      const {availableDeliveryMethods, deliveryDiscount} = this.storeDetails;
      const selectedDeliveryMethod = this.props.shopStore
        .storeSelectedDeliveryMethod[this.props.storeId];

      if (
        this.deliveryDiscountApplicable &&
        selectedDeliveryMethod === 'Own Delivery'
      ) {
        return (
          availableDeliveryMethods['Own Delivery'].deliveryPrice -
          deliveryDiscount.discountAmount
        );
      }

      return null;
    }
  }

  @computed get orderTotal() {
    if (this.storeDetails) {
      return this.deliveryAmount
        ? this.subTotal + this.deliveryAmount
        : this.subTotal;
    }

    return null;
  }

  @computed get subTotal() {
    let amount = 0;

    if (this.cartItems) {
      this.cartItems.map((item) => {
        const itemPrice = item.discountedPrice
          ? item.discountedPrice
          : item.price;
        const itemTotal = item.quantity * itemPrice;

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
    return this.props.shopStore.storeCartItems[this.props.storeId];
  }

  @computed get currentStoreItems() {
    const {storeId} = this.props;
    const storeItems = this.props.shopStore.storeCategoryItems.get(storeId);

    if (storeItems) {
      return storeItems.get('All');
    }

    return [];
  }

  @computed get selectedPayment() {
    const {selectedPaymentMethod} = this.state;

    return selectedPaymentMethod
      ? Object.values(selectedPaymentMethod)[0]
      : null;
  }

  @computed get deliveryMethods() {
    const {storeDetails} = this;

    if (storeDetails) {
      const {availableDeliveryMethods} = storeDetails;

      return Object.entries(availableDeliveryMethods)
        .filter(([key, value]) => value.activated)
        .map(([key, value]) => key)
        .sort((a, b) => a > b);
    }

    return [];
  }

  @computed get paymentMethods() {
    const {storeDetails} = this;

    if (storeDetails) {
      const {availablePaymentMethods} = storeDetails;

      return Object.entries(availablePaymentMethods)
        .filter(([key, value]) => value.activated)
        .map(([key, value]) => key)
        .sort((a, b) => a > b);
    }

    return [];
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
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  async getImage() {
    const {storeId} = this.props;

    const ref = storage().ref(`/images/stores/${storeId}/display.jpg`);
    const link = await ref.getDownloadURL().catch((err) => {
      return null;
    });

    this.url = {uri: link};
  }

  async setStoreAssignedMerchantId() {
    this.props.shopStore.storeAssignedMerchantId[
      this.props.storeId
    ] = this.storeDetails.merchantId;
  }

  async getStoreItemsSnapshot() {
    this.props.shopStore.setStoreItems(
      this.props.storeId,
      this.storeDetails.itemCategories,
    );
  }

  handleEmailChange = (email) => {
    this.props.shopStore.storeUserEmail[this.props.storeId] = email;

    this.checkEmail(this.props.shopStore.storeUserEmail[this.props.storeId]);
  };

  checkEmail = (email) => {
    const regexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/,
    );

    if (email.length !== 0 && regexp.test(email)) {
      this.setState({
        emailCheck: true,
      });
    } else {
      this.setState({
        emailCheck: false,
      });
    }
  };

  async componentDidMount() {
    const {checkout, storeId} = this.props;

    this.getImage();

    await this.setStoreAssignedMerchantId();

    if (this.props.cart) {
      this.getStoreItemsSnapshot();
    }

    if (checkout) {
      this.props.shopStore.storeUserEmail[
        storeId
      ] = this.props.authStore.userEmail;

      this.checkEmail(this.props.shopStore.storeUserEmail[storeId]);

      when(
        () => this.deliveryMethods.length > 0,
        () => {
          this.props.shopStore.storeSelectedDeliveryMethod[
            this.props.storeId
          ] = this.deliveryMethods[0];
        },
      );

      when(
        () => this.paymentMethods.length > 0,
        () => {
          if (!this.paymentMethods.includes('Online Banking')) {
            this.setState(
              {
                selectedPaymentMethod: {
                  COD: {
                    longName: 'Cash On Delivery',
                    shortName: 'COD',
                    remarks: 'Pay in cash when you receive your order!',
                    cost: 0,
                    currencies: 'PHP',
                    status: 'A',
                    surcharge: 0,
                  },
                },
              },
              () => {
                this.props.shopStore.storeSelectedPaymentMethod[
                  this.props.storeId
                ] = 'COD';
              },
            );
          }
        },
      );
    }
  }

  renderPaymentMethods() {
    const {storeDetails} = this;
    const {paymentMethods} = storeDetails;
    const {storeId, checkout} = this.props;
    const {selectedPaymentMethod} = this.state;
    const {availablePaymentMethods} = this.props.generalStore;

    if (
      checkout &&
      paymentMethods &&
      Object.keys(availablePaymentMethods).length > 0
    ) {
      return (
        <ScrollView
          style={{
            backgroundColor: colors.icons,
          }}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic">
          {Object.entries(availablePaymentMethods).map(
            ([key, value], index) => {
              const paymentMethod = {[key]: value};

              if (
                (key !== 'COD' && paymentMethods.includes('Online Banking')) ||
                (key === 'COD' && paymentMethods.includes('COD'))
              ) {
                return (
                  <ListItem
                    title={value.longName}
                    subtitle={
                      <Hyperlink
                        linkStyle={{color: colors.accent}}
                        onPress={(url, text) => this.openLink(url)}>
                        <Text
                          style={{
                            color: colors.text_secondary,
                          }}>
                          {
                            stripHtml(value.remarks, {
                              dumpLinkHrefsNearby: {
                                enabled: true,
                                putOnNewLine: false,
                                wrapHeads: '[',
                                wrapTails: ']',
                              },
                            }).result
                          }
                        </Text>
                      </Hyperlink>
                    }
                    topDivider
                    leftElement={
                      key === 'COD' ? (
                        <View
                          style={{
                            width: '20%',
                            height: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Icon name="dollar-sign" color="green" size={40} />
                        </View>
                      ) : (
                        <FastImage
                          source={{uri: value.logo}}
                          style={{width: '20%', height: 50}}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                      )
                    }
                    disabled={value.status !== 'A'}
                    key={key}
                    containerStyle={{
                      paddingBottom:
                        index ===
                        Object.keys(availablePaymentMethods).length - 1
                          ? 45
                          : 15,
                    }}
                    rightIcon={
                      selectedPaymentMethod &&
                      selectedPaymentMethod[key] === paymentMethod[key] ? (
                        <Icon name="check" color={colors.primary} />
                      ) : null
                    }
                    onPress={() =>
                      this.setState(
                        {selectedPaymentMethod: paymentMethod},
                        () => {
                          this.props.shopStore.storeSelectedPaymentMethod[
                            storeId
                          ] = Object.keys(paymentMethod)[0];
                        },
                      )
                    }
                  />
                );
              }
            },
          )}
        </ScrollView>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.icons,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  renderDeliveryMethods() {
    const {deliveryMethods} = this;
    const {storeId} = this.props;
    const storeSelectedDeliveryMethod = this.props.shopStore
      .storeSelectedDeliveryMethod[storeId];

    if (deliveryMethods.length > 0) {
      return (
        <ScrollView
          style={{
            backgroundColor: colors.icons,
          }}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic">
          {deliveryMethods.map((deliveryMethod, index) => {
            return (
              <ListItem
                title={deliveryMethod}
                key={`${deliveryMethod}-${index}`}
                bottomDivider
                rightIcon={
                  storeSelectedDeliveryMethod &&
                  storeSelectedDeliveryMethod === deliveryMethod ? (
                    <Icon name="check" color={colors.primary} />
                  ) : null
                }
                onPress={() =>
                  (this.props.shopStore.storeSelectedDeliveryMethod[
                    storeId
                  ] = deliveryMethod)
                }
              />
            );
          })}
        </ScrollView>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.icons,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  render() {
    const {storeId, checkout} = this.props;
    const {
      storeSelectedDeliveryMethod,
      storeSelectedPaymentMethod,
      storeUserEmail,
    } = this.props.shopStore;
    const {
      paymentOptionsModal,
      deliveryOptionsModal,
      selectedPaymentMethod,
      emailCheck,
    } = this.state;
    const {storeDetails, selectedPayment} = this;
    const {deliveryDiscount, availableDeliveryMethods} = storeDetails;
    const selectedDelivery = storeSelectedDeliveryMethod[storeId];
    const selectedPaymentKey = storeSelectedPaymentMethod[storeId];
    const email = storeUserEmail[storeId];

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
        <SelectionModal
          isVisible={paymentOptionsModal}
          title="Payment Method"
          closeModal={() => this.setState({paymentOptionsModal: false})}
          confirmDisabled={!selectedPaymentMethod}
          renderItems={this.renderPaymentMethods()}
        />

        <SelectionModal
          isVisible={deliveryOptionsModal}
          title="Delivery Method"
          closeModal={() => this.setState({deliveryOptionsModal: false})}
          confirmDisabled={
            !this.props.shopStore.storeSelectedDeliveryMethod[storeId]
          }
          renderItems={this.renderDeliveryMethods()}
        />

        <Card
          containerStyle={{
            margin: 0,
            marginVertical: 10,
            paddingTop: 5,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: 5,
            borderRadius: 10,
            elevation: 3,
            overflow: 'hidden',
          }}>
          <View>
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

              <View style={{flex: 1}}>
                {storeDetails.storeName && (
                  <Text
                    numberOfLines={3}
                    style={{
                      fontSize: 19,
                      fontFamily: 'ProductSans-Light',
                      maxWidth: '50%',
                      flexWrap: 'wrap',
                    }}>
                    {storeDetails.storeName}
                  </Text>
                )}

                {deliveryDiscount.activated && (
                  <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    style={{
                      fontSize: 13,
                      fontFamily: 'ProductSans-Bold',
                      flexShrink: 1,
                      color: colors.primary,
                    }}>
                    {`Get a ₱${deliveryDiscount.discountAmount} delivery discount if your order reaches more than ₱${deliveryDiscount.minimumOrderAmount}!`}
                  </Text>
                )}
              </View>
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
                    storeId={storeId}
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

                  {this.deliveryAmount ? (
                    <Text
                      style={{
                        fontFamily: 'ProductSans-Black',
                        fontSize: 18,
                        textAlignVertical: 'center',
                        color: colors.text_primary,
                      }}>
                      {`₱${availableDeliveryMethods[selectedDelivery].deliveryPrice}`}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'ProductSans-Black',
                        fontSize: 14,
                        textAlignVertical: 'center',
                      }}>
                      (Will be shown after store accepts the order)
                    </Text>
                  )}
                </View>

                {this.deliveryDiscountApplicable && (
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
                        style={{
                          fontSize: 17,
                          fontFamily: 'ProductSans-Regular',
                        }}>
                        Delivery Discount
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'ProductSans-Black',
                        fontSize: 18,
                        textAlignVertical: 'center',
                        color: colors.primary,
                      }}>
                      {`-₱${deliveryDiscount.discountAmount}`}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 10,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{fontSize: 17, fontFamily: 'ProductSans-Regular'}}>
                    Order Total
                  </Text>

                  <Text style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
                    ₱{this.orderTotal}
                  </Text>
                </View>
              </View>
            )}

            {storeDetails ? (
              checkout && (
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: 10,
                    marginTop: 10,
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      marginVertical: 5,
                    }}>
                    <ListItem
                      title="Delivery Method"
                      onPress={() =>
                        this.setState({deliveryOptionsModal: true})
                      }
                      subtitle={
                        selectedDelivery
                          ? selectedDelivery
                          : 'Please select a delivery method'
                      }
                      subtitleStyle={{fontSize: 14, color: colors.primary}}
                      titleStyle={{fontSize: 18}}
                      style={{borderRadius: 10}}
                      containerStyle={{
                        borderRadius: 10,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.2,
                        shadowRadius: 1.41,
                      }}
                      chevron
                    />
                  </View>

                  <View
                    style={{
                      marginTop: 5,
                      backgroundColor: colors.icons,
                      elevation: 3,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      borderRadius: 10,
                    }}>
                    <ListItem
                      title="Payment Method"
                      onPress={() => this.setState({paymentOptionsModal: true})}
                      subtitle={
                        selectedPayment
                          ? selectedPayment.minAmount &&
                            selectedPayment.maxAmount
                            ? `${selectedPayment.shortName} (₱${selectedPayment.minAmount} - ₱${selectedPayment.maxAmount})`
                            : `${selectedPayment.longName}`
                          : 'Please select a payment method'
                      }
                      subtitleStyle={{fontSize: 14, color: colors.primary}}
                      titleStyle={{fontSize: 18}}
                      style={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomRightRadius:
                          selectedPaymentKey && selectedPaymentKey !== 'COD'
                            ? 0
                            : 10,
                        borderBottomLeftRadius:
                          selectedPaymentKey && selectedPaymentKey !== 'COD'
                            ? 0
                            : 10,
                      }}
                      containerStyle={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomRightRadius:
                          selectedPaymentKey && selectedPaymentKey !== 'COD'
                            ? 0
                            : 10,
                        borderBottomLeftRadius:
                          selectedPaymentKey && selectedPaymentKey !== 'COD'
                            ? 0
                            : 10,
                      }}
                      chevron
                    />

                    {selectedPaymentKey && selectedPaymentKey !== 'COD' && (
                      <ListItem
                        topDivider
                        title="Email Address"
                        titleStyle={{fontSize: 18, flex: 0}}
                        style={{borderRadius: 10}}
                        containerStyle={{borderRadius: 10}}
                        subtitle={
                          <View
                            style={{
                              flexDirection: 'column',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                width: '100%',
                                alignItems: 'center',
                              }}>
                              <Input
                                placeholder="gordon_norman@gmail.com"
                                placeholderTextColor={colors.text_secondary}
                                leftIcon={
                                  <Icon
                                    name="mail"
                                    color={colors.primary}
                                    size={20}
                                  />
                                }
                                rightIcon={
                                  emailCheck ? (
                                    <Animatable.View
                                      useNativeDriver
                                      animation="bounceIn">
                                      <Icon
                                        name="check-circle"
                                        color="#388e3c"
                                        size={20}
                                      />
                                    </Animatable.View>
                                  ) : null
                                }
                                inputStyle={{fontSize: 16}}
                                containerStyle={{
                                  marginBottom: -20,
                                }}
                                maxLength={256}
                                autoCapitalize="none"
                                value={email}
                                onChangeText={(value) =>
                                  this.handleEmailChange(value)
                                }
                              />
                            </View>

                            <Text
                              style={{
                                color: colors.text_secondary,
                                fontSize: 12,
                              }}>
                              We'll send you your receipt here
                            </Text>
                          </View>
                        }
                      />
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
          </View>
        </Card>
      </View>
    );
  }
}

export default CartStoreCard;
