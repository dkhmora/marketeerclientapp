import React, {PureComponent} from 'react';
import {Card, CardItem, Text, View} from 'native-base';
import {Button, Icon} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../../../assets/colors';
import {styles} from '../../../../assets/styles';
import FastImage from 'react-native-fast-image';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ItemDescriptionModal from '../../ItemDescriptionModal';
import {PlaceholderMedia, Fade, Placeholder} from 'rn-placeholder';
import {CDN_BASE_URL} from '../../util/variables';
import ItemQuantityControlButtons from '../../ItemQuantityControlButtons';

@inject('authStore')
@inject('shopStore')
@observer
class ItemCard extends PureComponent {
  constructor(props) {
    super(props);

    const {item, storeId} = this.props;
    const itemQuantity = this.props.shopStore.getCartItemQuantity(
      item,
      storeId,
    );
    const itemStock = item.stock;

    this.state = {
      ready: false,
      addDisabled: itemQuantity >= itemStock ? true : false,
      minusButtonShown: itemQuantity > 0 ? true : false,
      writeTimer: null,
      overlay: false,
    };
  }

  @computed get cartItemQuantity() {
    const {item, storeId} = this.props;

    if (this.props.shopStore.storeCartItems?.[storeId]) {
      const cartItem = this.props.shopStore.storeCartItems[storeId].find(
        (storeCartItem) => storeCartItem.itemId === item.itemId,
      );

      if (cartItem) {
        return cartItem.quantity;
      }
    }

    return 0;
  }

  @computed get cartItemIndex() {
    const {item, storeId} = this.props;

    if (this.props.shopStore.storeCartItems) {
      if (this.props.shopStore.storeCartItems[storeId]) {
        const itemIndex = this.props.shopStore.storeCartItems[
          storeId
        ].findIndex((storeCartItem) => storeCartItem.itemId === item.itemId);

        if (itemIndex >= 0) {
          return itemIndex;
        }
      }
    }

    return 0;
  }

  componentDidUpdate() {
    if (this.state.minusButtonShown && this.cartItemQuantity <= 0) {
      this.hideMinusButton();
    }

    if (this.cartItemQuantity > 0 && !this.state.minusButtonShown) {
      this.showMinusButton();
    }
  }

  showMinusButton() {
    this.setState({minusButtonShown: true}, () => {
      this.itemQuantityControlButtonsRef?.buttonCounterView?.fadeInRight(200) &&
        this.itemQuantityControlButtonsRef?.plusButton?.transformPlusButton(
          300,
        );
    });
  }

  hideMinusButton() {
    this.setState({minusButtonShown: false}, () => {
      this.itemQuantityControlButtonsRef?.buttonCounterView?.fadeOutRight(
        200,
      ) &&
        this.itemQuantityControlButtonsRef?.plusButton?.deTransformPlusButton(
          300,
        );
    });
  }

  handleIncreaseQuantity() {
    const {
      props: {item, storeId},
      cartItemQuantity,
    } = this;

    const updatedItem = JSON.parse(JSON.stringify(item));

    updatedItem.quantity = cartItemQuantity + 1;

    this.props.shopStore.addCartItemToStorage(updatedItem, storeId);

    this.cartItemQuantity === parseInt(item.stock, 10) &&
      this.setState({addDisabled: true});
  }

  handleDecreaseQuantity() {
    const {item, storeId} = this.props;

    this.props.shopStore.deleteCartItemInStorage(item, storeId);

    this.cartItemQuantity <= item.stock && this.setState({addDisabled: false});
  }

  render() {
    const {
      name,
      price,
      discountedPrice,
      image,
      stock,
      unit,
      description,
    } = this.props.item;

    const {addDisabled, ready} = this.state;
    const url = image
      ? {uri: `${CDN_BASE_URL}${image}`}
      : require('../../../../assets/images/placeholder.jpg');

    return (
      <Animatable.View
        useNativeDriver
        animation="fadeIn"
        duration={350}
        style={{
          flex: 1,
          flexDirection: 'column',
          paddingHorizontal: 5,
        }}>
        <ItemDescriptionModal
          isVisible={this.state.overlay}
          onBackdropPress={() => this.setState({overlay: false})}
          description={description}
          name={name}
          price={price}
          discountedPrice={discountedPrice}
          unit={unit}
          stock={stock}
          url={url}
        />

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
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              elevation: 2,
            }}>
            <View
              style={{
                backgroundColor: colors.icons,
                paddingHorizontal: 10,
                paddingVertical: 10,
                elevation: 3,
                zIndex: 10,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
              }}>
              <TouchableOpacity onPress={() => this.setState({overlay: true})}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 0,
                  }}>
                  <View style={{flex: 1, flexDirection: 'column'}}>
                    <Text
                      maxFontSizeMultiplier={1.5}
                      numberOfLines={1}
                      style={{
                        color: colors.text_secondary,
                        fontFamily: 'ProductSans-Regular',
                      }}>
                      {name}
                    </Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {discountedPrice ? (
                        <Text
                          maxFontSizeMultiplier={1}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          style={{
                            textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid',
                            color: colors.text_secondary,
                            fontSize: 14,
                            marginRight: 5,
                          }}>
                          ₱{price}
                        </Text>
                      ) : null}

                      <Text
                        maxFontSizeMultiplier={1}
                        numberOfLines={1}
                        style={{
                          color: colors.text_primary,
                          fontFamily: 'ProductSans-Black',
                          flexWrap: 'wrap',
                        }}>
                        ₱{discountedPrice ? discountedPrice : price}
                        {unit && `/${unit}`}
                      </Text>
                    </View>
                  </View>

                  <View style={{width: 30}}>
                    <Icon name="info" color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <CardItem cardBody>
              <View style={{flex: 1}}>
                <FastImage
                  source={url}
                  style={{
                    aspectRatio: 1,
                    flex: 1,
                    opacity: ready ? 1 : 0,
                  }}
                  onLoad={() =>
                    this.setState({ready: true}, () => {
                      if (this.cartItemQuantity >= 1) {
                        this.showMinusButton();
                      }
                    })
                  }
                  resizeMode={FastImage.resizeMode.contain}
                />

                {!ready && (
                  <View style={{position: 'absolute'}}>
                    <Placeholder Animation={Fade}>
                      <PlaceholderMedia
                        style={{
                          backgroundColor: colors.primary,
                          flex: 1,
                          height: '100%',
                          width: '100%',
                          aspectRatio: 1,
                        }}
                      />
                    </Placeholder>
                  </View>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  borderBottomRightRadius: 10,
                  backgroundColor: colors.icons,
                  opacity: 0.9,
                  borderColor: 'rgba(0,0,0,0.4)',
                  padding: 2,
                  paddingRight: 4,
                  alignItems: 'center',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}>
                {stock > 0 ? (
                  <View style={{flexDirection: 'row'}}>
                    <Text maxFontSizeMultiplier={1} style={{fontSize: 14}}>
                      {stock}
                    </Text>

                    <Text
                      maxFontSizeMultiplier={1}
                      style={{
                        fontSize: 14,
                        textAlign: 'center',
                        color: colors.text_secondary,
                      }}>
                      {' '}
                      Left
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      textAlign: 'center',
                      color: colors.danger,
                    }}>
                    Out of Stock
                  </Text>
                )}
              </View>
            </CardItem>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 10,
                right: 10,
              }}>
              <ItemQuantityControlButtons
                ref={(itemQuantityControlButtonsRef) =>
                  (this.itemQuantityControlButtonsRef = itemQuantityControlButtonsRef)
                }
                addDisabled={addDisabled}
                onIncreaseQuantity={() => this.handleIncreaseQuantity()}
                onDecreaseQuantity={() => this.handleDecreaseQuantity()}
                itemQuantity={this.cartItemQuantity}
                itemStock={stock}
              />
            </View>
          </Card>
        </View>
      </Animatable.View>
    );
  }
}

export default ItemCard;
