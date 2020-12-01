import React, {PureComponent} from 'react';
import FastImage from 'react-native-fast-image';
import {Text, Button, Icon, Divider} from 'react-native-elements';
import {computed} from 'mobx';
import {StyleSheet, View, TouchableWithoutFeedback} from 'react-native';
import {observer, inject} from 'mobx-react';
import {styles} from '../../assets/styles';
import {colors} from '../../assets/colors';
import {CDN_BASE_URL} from '../util/variables';
import ItemQuantityControlButtons from './ItemQuantityControlButtons';

@inject('shopStore')
@inject('authStore')
@observer
class CartListItem extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleIncreaseQuantity() {
    const {item, storeId} = this.props;

    const updatedItem = JSON.parse(JSON.stringify(item));

    updatedItem.quantity = item.quantity + 1;

    this.props.shopStore.addCartItemToStorage(updatedItem, storeId);
  }

  handleDecreaseQuantity() {
    const {item, storeId} = this.props;

    this.props.shopStore.deleteCartItemInStorage(item, storeId);

    this.props.shopStore.updateCartItems();
  }

  componentDidUpdate(prevProps, prevState) {
    const {item, itemSnapshot} = this.props;

    if (
      itemSnapshot?.stock !== undefined &&
      item.quantity > itemSnapshot.stock
    ) {
      this.props.shopStore.validItemQuantity[item.itemId] = false;
    } else {
      this.props.shopStore.validItemQuantity[item.itemId] = true;
    }
  }

  render() {
    const {item, storeType, cart, itemSnapshot, checkout, onPress} = this.props;
    const optionsPrice = item.totalOptionsPrice ? item.totalOptionsPrice : 0;
    const itemPrice = item.discountedPrice ? item.discountedPrice : item.price;
    const totalItemPrice = itemPrice + optionsPrice;
    const imageUrl = item.image
      ? {uri: `${CDN_BASE_URL}${item.image}`}
      : require('../../assets/images/placeholder.jpg');

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: colors.icons,
            }}>
            <View
              style={{
                elevation: 3,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: colors.icons,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.divider,
              }}>
              <FastImage
                key={item.itemId}
                source={imageUrl}
                style={{
                  backgroundColor: colors.primary,
                  height: 55,
                  width: 55,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                paddingHorizontal: 10,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 18,
                  flexWrap: 'wrap',
                }}>
                {item.name}
              </Text>

              <Text
                numberOfLines={2}
                style={{
                  fontFamily: 'ProductSans-Light',
                  fontSize: 14,
                  color: colors.text_secondary,
                  flexWrap: 'wrap',
                }}>
                {item.description}
              </Text>
            </View>

            {!checkout && (
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                  borderRadius: 30,
                }}>
                {cart && itemSnapshot?.stock !== undefined && (
                  <View
                    style={{
                      flexDirection: 'row',
                      borderRadius: 30,
                      borderWidth: StyleSheet.hairlineWidth,
                      backgroundColor: colors.primary,
                      borderColor: colors.divider,
                      marginBottom: 5,
                      padding: 5,
                      alignItems: 'center',
                      elevation: 2,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'ProductSans-Bold',
                        color: colors.icons,
                      }}>
                      {`${itemSnapshot.stock}  `}
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        textAlign: 'center',
                        color: colors.icons,
                      }}>
                      Left
                    </Text>
                  </View>
                )}

                <ItemQuantityControlButtons
                  onIncreaseQuantity={() => this.handleIncreaseQuantity()}
                  onDecreaseQuantity={() => this.handleDecreaseQuantity()}
                  itemQuantity={item.quantity}
                  itemStock={itemSnapshot?.stock}
                  addButtonContainerStyle={{
                    height: 26,
                    width: 26,
                    borderRadius: 26,
                  }}
                  iconSize={10}
                  minusButtonContainerStyle={{
                    height: 26,
                    width: 26,
                    borderRadius: 26,
                  }}
                  alwaysShowMinusButton
                  quantityContainerStyle={{
                    width: 26,
                    height: 26,
                  }}
                  containerStyle={{
                    elevation: 3,
                    height: 26,
                    marginHorizontal: 5,
                  }}
                />
              </View>
            )}

            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                width: 60,
              }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{
                  fontFamily: 'ProductSans-Black',
                  fontSize: 16,
                  color: colors.text_secondary,
                }}>
                ₱{totalItemPrice}
              </Text>

              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{
                  color: colors.text_secondary,
                  borderBottomColor: colors.divider,
                  borderBottomWidth: 1,
                  textAlign: 'right',
                  width: '100%',
                }}>
                x {item.quantity}
              </Text>

              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
                ₱{totalItemPrice * item.quantity}
              </Text>
            </View>
          </View>

          <Divider style={{paddingBottom: 0.5}} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default CartListItem;
