import React, {PureComponent} from 'react';
import {View, ActivityIndicator, ScrollView} from 'react-native';
import {
  Card,
  Text,
  Icon,
  ListItem,
  Input,
  Divider,
} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import CartListItem from './CartListItem';
import {colors} from '../../assets/colors';
import {observable, computed, when, action} from 'mobx';
import SelectionModal from './SelectionModal';
import FastImage from 'react-native-fast-image';
import Hyperlink from 'react-native-hyperlink';
import stripHtml from 'string-strip-html';
import * as Animatable from 'react-native-animatable';
import {CDN_BASE_URL} from '../util/variables';
import {withNavigation} from '@react-navigation/compat';
import {openLink} from '../util/helpers';
import VoucherList from './vouchers/VoucherList';
import Toast from './Toast';

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
      voucherSelectionModal: false,
      emailCheck: false,
    };
  }

  @observable url = null;

  @observable storeDetails = this.props.shopStore.allStoresMap[
    this.props.storeId
  ];

  @computed get orderTotal() {
    const {subTotal} = this;

    if (this.storeDetails) {
      const {
        selectedDeliveryMethod,
        storeDetails: {availableDeliveryMethods},
        storeDeliveryDiscount,
        marketeerVoucherDeliveryDiscount,
      } = this;

      if (selectedDeliveryMethod === 'Own Delivery') {
        let totalDeliveryDiscount = 0;

        if (typeof storeDeliveryDiscount === 'number') {
          totalDeliveryDiscount += storeDeliveryDiscount;
        }
        if (typeof marketeerVoucherDeliveryDiscount === 'number') {
          totalDeliveryDiscount += marketeerVoucherDeliveryDiscount;
        }

        const finalDeliveryPrice =
          availableDeliveryMethods['Own Delivery'].deliveryPrice -
          totalDeliveryDiscount;

        return subTotal + Math.max(0, finalDeliveryPrice);
      }
    }

    return subTotal;
  }

  @computed get subTotal() {
    let amount = 0;

    if (this.cartItems) {
      this.cartItems.map((item) => {
        const optionsPrice = item.totalOptionsPrice
          ? item.totalOptionsPrice
          : 0;
        const itemPrice = item.discountedPrice
          ? item.discountedPrice
          : item.price;
        const totalItemPrice = itemPrice + optionsPrice;
        const totalCartPrice = item.quantity * totalItemPrice;

        amount = totalCartPrice + amount;
      });
    }

    return amount;
  }

  @computed get storeDeliveryFee() {
    const {storeDetails: {availableDeliveryMethods} = {}} = this;

    return availableDeliveryMethods?.['Own Delivery']?.deliveryPrice;
  }

  @computed get deliveryFeeText() {
    const {selectedDeliveryMethod, freeDelivery, storeDeliveryFee} = this;

    if (selectedDeliveryMethod === 'Mr. Speedy') {
      return 'TBD';
    }
    if (selectedDeliveryMethod === 'Own Delivery') {
      return freeDelivery ? 'Free Delivery' : `₱${storeDeliveryFee}`;
    }

    return 'Please discuss with merchant';
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

  @computed get selectedPaymentMethod() {
    const {
      props: {
        shopStore: {cartStoreSnapshots},
        storeId,
      },
    } = this;

    return cartStoreSnapshots?.[storeId]?.paymentMethod;
  }

  @computed get deliveryMethods() {
    const {storeDetails} = this;

    if (storeDetails) {
      const {availableDeliveryMethods} = storeDetails;
      if (availableDeliveryMethods) {
        return Object.entries(availableDeliveryMethods)
          .filter(([key, value]) => value.activated)
          .map(([key, value]) => key)
          .sort((a, b) => a > b);
      }
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

  @computed get selectedDeliveryMethod() {
    const {
      props: {
        shopStore: {cartStoreSnapshots},
        storeId,
      },
    } = this;

    return cartStoreSnapshots?.[storeId]?.deliveryMethod;
  }

  @computed get selectedDeliveryText() {
    const {selectedDeliveryMethod, storeDeliveryFee} = this;

    const listText =
      selectedDeliveryMethod === 'Mr. Speedy'
        ? `Mr. Speedy (To be determined once seller ships order)`
        : selectedDeliveryMethod === 'Own Delivery'
        ? `Store Delivery (₱${storeDeliveryFee})`
        : selectedDeliveryMethod
        ? selectedDeliveryMethod
        : 'Please select a delivery method';

    return listText;
  }

  @computed get selectedPaymentMethodSubtitleText() {
    const {
      props: {
        generalStore: {availablePaymentMethods},
      },
      selectedPaymentMethod,
    } = this;

    const selectedPaymentMethodDetails =
      availablePaymentMethods?.[selectedPaymentMethod];

    if (selectedPaymentMethodDetails !== undefined) {
      const {
        minAmount,
        maxAmount,
        longName,
        shortName,
      } = selectedPaymentMethodDetails;

      if (minAmount && maxAmount) {
        return `${shortName} (₱${minAmount} - ₱${maxAmount})`;
      }

      return `${longName}`;
    }

    return 'Please select a payment method';
  }

  @computed get selectedVoucherId() {
    const {
      props: {
        shopStore: {cartStoreSnapshots},
        storeId,
      },
    } = this;

    return cartStoreSnapshots?.[storeId]?.vouchersApplied?.delivery;
  }

  @computed get selectedVoucherDetails() {
    const {
      props: {
        generalStore: {appwideVouchers},
      },
      selectedVoucherId,
    } = this;

    if (selectedVoucherId !== undefined) {
      return appwideVouchers?.[selectedVoucherId];
    }
  }

  @computed get deliveryFeeSubtitle() {
    const {selectedDeliveryMethod} = this;

    if (selectedDeliveryMethod === 'Mr. Speedy') {
      return 'The delivery fee will vary depending on the total weight of your order';
    }
  }

  @computed get appliedVoucherSubtitle() {
    if (this.selectedVoucherDetails) {
      const {
        selectedVoucherDetails: {
          title,
          discount: {amount},
          type,
        },
      } = this;
      const deliveryTypeText =
        type === 'delivery_discount' ? 'delivery' : 'order';

      return `${title} (Enjoy ₱${amount} off your ${deliveryTypeText}!)`;
    }

    return 'None selected';
  }

  @computed get storeDeliveryDiscount() {
    const {
      props: {},
      storeDetails: {
        deliveryDiscount: {activated, discountAmount, minimumOrderAmount} = {},
      } = {},
      subTotal,
    } = this;

    if (activated && minimumOrderAmount && subTotal >= minimumOrderAmount) {
      return discountAmount;
    }
  }

  @computed get marketeerVoucherDeliveryDiscount() {
    if (this.selectedVoucherDetails) {
      const {
        selectedVoucherDetails: {
          title,
          discount: {amount},
          type,
          minimumOrderAmount,
        },
        subTotal,
      } = this;

      if (subTotal >= minimumOrderAmount) {
        return amount;
      }
    }
  }

  @computed get storeAssignedEmail() {
    const {
      props: {
        shopStore: {cartStoreSnapshots},
        storeId,
      },
    } = this;

    return cartStoreSnapshots?.[storeId]?.email;
  }

  getStoreItemsSnapshot = () => {
    this.props.shopStore.setStoreItems(
      this.props.storeId,
      this.storeDetails.itemCategories,
    );
  };

  handleOpenLink(url) {
    this.props.generalStore
      .toggleAppLoader()
      .then(() => openLink(url))
      .then(() => this.props.generalStore.toggleAppLoader());
  }

  handleEmailChange = (email) => {
    const {
      props: {storeId},
      storeAssignedEmail,
      checkEmail,
    } = this;
    this.props.shopStore.assignPropToStoreId(storeId, 'email', email);

    checkEmail(storeAssignedEmail);
  };

  checkEmail = (email) => {
    const regexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/,
    );

    if (email?.length !== 0 && regexp.test(email)) {
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
    const {
      props: {
        authStore: {userEmail},
        shopStore: {cartStoreSnapshots},
        checkout,
        storeId,
        cart,
      },
      storeDetails: {merchantId} = {},
      paymentMethods,
      deliveryMethods,
      getStoreItemsSnapshot,
      checkEmail,
    } = this;

    when(
      () => merchantId !== undefined,
      () =>
        this.props.shopStore.assignPropToStoreId(
          storeId,
          'merchantId',
          merchantId,
        ),
    );

    if (cart) {
      getStoreItemsSnapshot();
    }

    if (checkout) {
      this.props.shopStore.assignPropToStoreId(storeId, 'email', userEmail);

      when(
        () => cartStoreSnapshots?.[storeId]?.email !== undefined,
        () => checkEmail(cartStoreSnapshots[storeId].email),
      );

      when(
        () => deliveryMethods.length > 0,
        () =>
          this.props.shopStore.assignPropToStoreId(
            storeId,
            'deliveryMethod',
            deliveryMethods[0],
          ),
      );

      when(
        () => paymentMethods.length > 0,
        () => {
          if (!paymentMethods.includes('Online Banking')) {
            this.props.shopStore.assignPropToStoreId(
              storeId,
              'paymentMethod',
              'COD',
            );
          }
        },
      );
    }
  }

  renderPaymentMethods() {
    const {
      props: {
        generalStore: {availablePaymentMethods},
        storeId,
        checkout,
      },
      selectedPaymentMethod,
      handleOpenLink,
      paymentMethods,
    } = this;

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
                        onPress={(url, text) => handleOpenLink(url)}>
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
                      selectedPaymentMethod === key ? (
                        <Icon name="check" color={colors.primary} />
                      ) : null
                    }
                    onPress={() =>
                      this.props.shopStore.assignPropToStoreId(
                        storeId,
                        'paymentMethod',
                        Object.keys(paymentMethod)[0],
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
    const {
      props: {storeId},
      deliveryMethods,
      selectedDeliveryMethod,
      storeDeliveryFee,
    } = this;

    if (deliveryMethods.length > 0) {
      return (
        <ScrollView
          style={{
            backgroundColor: colors.icons,
          }}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic">
          {deliveryMethods
            .slice()
            .sort((a, b) => a > b)
            .map((deliveryMethod, index) => {
              const listText =
                deliveryMethod === 'Mr. Speedy'
                  ? 'Mr. Speedy (To be determined once seller ships order)'
                  : deliveryMethod === 'Own Delivery'
                  ? `Store Delivery (₱${storeDeliveryFee})`
                  : deliveryMethod;

              return (
                <ListItem
                  title={listText}
                  key={`${deliveryMethod}-${index}`}
                  bottomDivider
                  rightIcon={
                    selectedDeliveryMethod &&
                    selectedDeliveryMethod === deliveryMethod ? (
                      <Icon name="check" color={colors.primary} />
                    ) : null
                  }
                  onPress={() =>
                    this.props.shopStore.assignPropToStoreId(
                      storeId,
                      'deliveryMethod',
                      deliveryMethod,
                    )
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

  renderClaimedVouchers() {
    const {
      props: {
        generalStore: {
          voucherLists: {claimed},
          useableVoucherIds,
        },
        storeId,
      },
      selectedVoucherId,
      subTotal,
    } = this;

    return (
      <VoucherList
        vouchers={claimed}
        keyPrefix="claimed"
        voucherSelected={selectedVoucherId}
        orderAmount={subTotal}
        emptyText="You haven't claimed any vouchers yet. Check out the Vouchers page to get amazing deals!"
        onDeliveryVoucherPress={(voucherId) => {
          const voucherIsApplicable = useableVoucherIds[voucherId] > 0;
          const voucherIsSelected = selectedVoucherId === voucherId;

          this.props.generalStore.useVoucher(voucherId, {
            voucherIsSelected,
            voucherIsApplicable,
          });

          this.props.shopStore.assignPropToStoreId(storeId, 'vouchersApplied', {
            delivery:
              voucherIsSelected || !voucherIsApplicable ? null : voucherId,
          });
        }}
      />
    );
  }

  render() {
    const {
      props: {storeId, checkout, navigation, cart},
      state: {
        voucherSelectionModal,
        paymentOptionsModal,
        deliveryOptionsModal,
        emailCheck,
      },
      storeDetails,
      selectedPaymentMethod,
      selectedDeliveryMethod,
      storeAssignedEmail,
      appliedVoucherSubtitle,
      storeDeliveryDiscount,
      marketeerVoucherDeliveryDiscount,
      selectedPaymentMethodSubtitleText,
      deliveryFeeSubtitle,
      selectedDeliveryText,
      orderTotal,
    } = this;
    const storeImageUrl = {
      uri: `${CDN_BASE_URL}/images/stores/${storeId}/display.jpg`,
    };
    const isNotCOD = selectedPaymentMethod && selectedPaymentMethod !== 'COD';

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
          title="Select Payment Method"
          closeModal={() => this.setState({paymentOptionsModal: false})}
          renderItems={this.renderPaymentMethods()}
        />

        <SelectionModal
          isVisible={deliveryOptionsModal}
          title="Select Delivery Method"
          closeModal={() => this.setState({deliveryOptionsModal: false})}
          renderItems={this.renderDeliveryMethods()}
        />

        <SelectionModal
          isVisible={voucherSelectionModal}
          title="Select Voucher"
          closeModal={() => this.setState({voucherSelectionModal: false})}
          renderItems={this.renderClaimedVouchers()}
        />

        <Card
          containerStyle={{
            margin: 0,
            marginVertical: 10,
            paddingTop: 0,
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
                paddingVertical: 5,
                paddingHorizontal: 10,
                elevation: 3,
                backgroundColor: colors.icons,
              }}>
              <FastImage
                source={storeImageUrl}
                style={{
                  height: 40,
                  width: 40,
                  marginRight: 10,
                  borderRadius: 30,
                  borderColor: colors.primary,
                  borderWidth: 3,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />

              <View style={{flex: 1}}>
                {storeDetails?.storeName && (
                  <Text
                    numberOfLines={3}
                    style={{
                      fontSize: 19,
                      fontFamily: 'ProductSans-Bold',
                      maxWidth: '50%',
                      flexWrap: 'wrap',
                    }}>
                    {storeDetails?.storeName}
                  </Text>
                )}

                {storeDetails?.deliveryDiscount &&
                  storeDetails?.deliveryDiscount?.activated && (
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={{
                        fontSize: 13,
                        fontFamily: 'ProductSans-Bold',
                        flexShrink: 1,
                        color: colors.primary,
                      }}>
                      {`Get a ₱${storeDetails?.deliveryDiscount?.discountAmount} delivery discount if your order reaches more than ₱${storeDetails?.deliveryDiscount?.minimumOrderAmount}!`}
                    </Text>
                  )}
              </View>
            </View>

            <Divider />

            <View>
              {this.cartItems.map((item) => {
                const itemSnapshot = this.currentStoreItems.find(
                  (storeItem) => storeItem.itemId === item.itemId,
                );

                return (
                  <CartListItem
                    item={item}
                    cart={cart}
                    itemSnapshot={itemSnapshot}
                    storeType={storeDetails?.storeType}
                    storeId={storeId}
                    checkout={checkout}
                    onPress={() =>
                      item?.selectedOptions !== undefined &&
                      itemSnapshot?.options !== undefined
                        ? navigation.navigate('Food Item Details', {
                            item,
                            itemSnapshot,
                            storeId,
                          })
                        : null
                    }
                    key={`${item.itemId}${item.cartId ? item.cartId : ''}`}
                  />
                );
              })}
            </View>

            <ListItem
              title="Order Subtotal"
              subtitle={`(${this.totalItemQuantity} Items)`}
              rightTitle={`₱${this.subTotal.toFixed(2)}`}
              rightTitleStyle={{
                flex: 1,
                fontSize: 16,
                fontFamily: 'ProductSans-Black',
                color: colors.text_primary,
                textAlign: 'right',
                textAlignVertical: 'center',
              }}
              subtitleStyle={{fontSize: 12, color: colors.text_secondary}}
              titleStyle={{fontSize: 16}}
              rightContentContainerStyle={{flex: 1}}
              containerStyle={{paddingBottom: 5, paddingTop: 5}}
            />

            {checkout && (
              <View>
                <ListItem
                  title="Delivery Fee"
                  rightTitle={this.deliveryFeeText}
                  rightTitleStyle={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: 'ProductSans-Black',
                    color: colors.text_primary,
                    textAlign: 'right',
                  }}
                  subtitle={deliveryFeeSubtitle}
                  subtitleStyle={{
                    fontSize: 12,
                    color: colors.text_secondary,
                  }}
                  titleStyle={{
                    fontSize: 16,
                  }}
                  rightContentContainerStyle={{flex: 1}}
                  containerStyle={{
                    paddingBottom: 5,
                    paddingTop: 5,
                  }}
                />

                {storeDeliveryDiscount !== undefined && (
                  <ListItem
                    title="Store Delivery Discount"
                    rightTitle={`-₱${storeDeliveryDiscount}`}
                    rightTitleStyle={{
                      flex: 1,
                      fontSize: 16,
                      fontFamily: 'ProductSans-Black',
                      color: colors.text_primary,
                      textAlign: 'right',
                    }}
                    subtitleStyle={{fontSize: 14, color: colors.primary}}
                    titleStyle={{fontSize: 16}}
                    rightContentContainerStyle={{flex: 1}}
                    containerStyle={{
                      paddingBottom: 5,
                      paddingTop: 5,
                    }}
                  />
                )}

                {marketeerVoucherDeliveryDiscount !== undefined && (
                  <ListItem
                    title="Marketeer Voucher Delivery Discount"
                    rightTitle={`-₱${marketeerVoucherDeliveryDiscount}`}
                    rightTitleStyle={{
                      flex: 1,
                      fontSize: 16,
                      fontFamily: 'ProductSans-Black',
                      color: colors.text_primary,
                      textAlign: 'right',
                      textAlignVertical: 'center',
                    }}
                    subtitleStyle={{fontSize: 14, color: colors.primary}}
                    titleStyle={{fontSize: 16}}
                    rightContentContainerStyle={{flex: 1}}
                    containerStyle={{paddingBottom: 5, paddingTop: 5}}
                  />
                )}

                <ListItem
                  title="Order Total"
                  rightTitle={`₱${orderTotal.toFixed(2)}`}
                  rightTitleStyle={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: 'ProductSans-Black',
                    color: colors.text_primary,
                    textAlign: 'right',
                  }}
                  subtitleStyle={{
                    fontSize: 12,
                    color: colors.text_secondary,
                  }}
                  titleStyle={{fontSize: 16}}
                  subtitle={
                    selectedDeliveryMethod === 'Mr. Speedy'
                      ? 'The final order total will be shown after the store ships your order'
                      : ''
                  }
                  rightContentContainerStyle={{flex: 1}}
                  containerStyle={{paddingBottom: 5, paddingTop: 5}}
                />
              </View>
            )}

            {storeDetails ? (
              checkout && (
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: 10,
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      marginVertical: 5,
                    }}>
                    <ListItem
                      title="Applied Voucher"
                      onPress={() =>
                        this.setState({voucherSelectionModal: true})
                      }
                      subtitle={appliedVoucherSubtitle}
                      subtitleStyle={{fontSize: 14, color: colors.primary}}
                      titleStyle={{fontSize: 16}}
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
                      marginVertical: 5,
                    }}>
                    <ListItem
                      title="Delivery Method"
                      onPress={() =>
                        this.setState({deliveryOptionsModal: true})
                      }
                      subtitle={selectedDeliveryText}
                      subtitleStyle={{fontSize: 14, color: colors.primary}}
                      titleStyle={{fontSize: 16}}
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
                      subtitle={selectedPaymentMethodSubtitleText}
                      subtitleStyle={{fontSize: 14, color: colors.primary}}
                      titleStyle={{fontSize: 16}}
                      style={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: isNotCOD ? 0 : 10,
                        borderBottomLeftRadius: isNotCOD ? 0 : 10,
                      }}
                      containerStyle={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: isNotCOD ? 0 : 10,
                        borderBottomLeftRadius: isNotCOD ? 0 : 10,
                      }}
                      chevron
                    />

                    {isNotCOD && (
                      <ListItem
                        topDivider
                        title="Email Address"
                        titleStyle={{fontSize: 16, flex: 0}}
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
                                value={storeAssignedEmail}
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

export default withNavigation(CartStoreCard);
