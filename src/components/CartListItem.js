import React, {PureComponent} from 'react';
import FastImage from 'react-native-fast-image';
import {Text, Button, Icon, Divider} from 'react-native-elements';
import {computed} from 'mobx';
import {StyleSheet, View} from 'react-native';
import {observer, inject} from 'mobx-react';
import {styles} from '../../assets/styles';
import {colors} from '../../assets/colors';
import {CDN_BASE_URL} from './util/variables';

@inject('shopStore')
@inject('authStore')
@observer
class CartListItem extends PureComponent {
  constructor(props) {
    super(props);
  }

  @computed get addButtonDisabled() {
    const {item, itemSnapshot} = this.props;

    if (itemSnapshot) {
      return item.quantity >= itemSnapshot.stock;
    }
    return false;
  }

  handleIncreaseQuantity() {
    const {item, storeId} = this.props;

    this.props.shopStore.addCartItemToStorage(item, storeId);

    if (!this.addButtonDisabled) {
      this.props.shopStore.updateCartItems();
    }
  }

  handleDecreaseQuantity() {
    const {item, storeId} = this.props;

    this.props.shopStore.deleteCartItemInStorage(item, storeId);

    this.props.shopStore.updateCartItems();
  }

  componentDidUpdate(prevProps, prevState) {
    const {item, itemSnapshot} = this.props;

    if (itemSnapshot && item.quantity > itemSnapshot.stock) {
      this.props.shopStore.validItemQuantity[item.itemId] = false;
    } else {
      this.props.shopStore.validItemQuantity[item.itemId] = true;
    }
  }

  render() {
    const {item, storeType, itemSnapshot, checkout} = this.props;
    const itemPrice = item.discountedPrice ? item.discountedPrice : item.price;
    const imageUrl = item.image
      ? {uri: `${CDN_BASE_URL}${item.image}`}
      : require('../../assets/images/placeholder.jpg');
    console.log(storeType);
    return (
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
              {itemSnapshot?.stock !== undefined && (
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

              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 30,
                  overflow: 'hidden',
                  elevation: 3,
                }}>
                <View
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    borderRadius: 30,
                  }}>
                  <Button
                    onPress={() => this.handleDecreaseQuantity()}
                    type="clear"
                    color={colors.icons}
                    icon={
                      item.quantity === 1 ? (
                        <Icon name="trash-2" color={colors.primary} size={15} />
                      ) : (
                        <Icon name="minus" color={colors.primary} size={15} />
                      )
                    }
                    containerStyle={[
                      styles.buttonContainer,
                      {
                        backgroundColor: '#fff',
                        height: 30,
                        borderRadius: 30,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.22,
                        shadowRadius: 2.22,
                      },
                    ]}
                  />
                </View>

                <View
                  style={{
                    width: 30,
                    justifyContent: 'center',
                    elevation: 3,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontFamily: 'ProductSans-Black',
                      color:
                        itemSnapshot?.stock !== undefined &&
                        item.quantity > itemSnapshot.stock
                          ? '#F44336'
                          : colors.text_primary,
                    }}>
                    {item.quantity}
                  </Text>
                </View>

                <View
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}>
                  <Button
                    onPress={() => this.handleIncreaseQuantity()}
                    disabled={this.addButtonDisabled}
                    type="clear"
                    color={colors.icons}
                    icon={
                      <Icon
                        name="plus"
                        color={
                          this.addButtonDisabled
                            ? colors.text_secondary
                            : colors.primary
                        }
                        size={15}
                      />
                    }
                    containerStyle={[
                      styles.buttonContainer,
                      {
                        backgroundColor: '#fff',
                        height: 30,
                        borderRadius: 30,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.22,
                        shadowRadius: 2.22,
                      },
                    ]}
                  />
                </View>
              </View>
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
              ₱{itemPrice}
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
              ₱{itemPrice * item.quantity}
            </Text>
          </View>
        </View>

        <Divider style={{paddingBottom: 0.5}} />
      </View>
    );
  }
}

export default CartListItem;
