import React, {Component} from 'react';
import {Card, CardItem, Text, View} from 'native-base';
import {Image} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import {inject, observer} from 'mobx-react';
import {observable, computed} from 'mobx';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import FastImage from 'react-native-fast-image';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ItemDescriptionModal from './ItemDescriptionModal';
import ItemCardLoader from './ItemCardLoader';
@inject('authStore')
@inject('shopStore')
@observer
class ItemCard extends Component {
  constructor(props) {
    super(props);

    const {item, storeName} = this.props;
    const itemQuantity = this.props.shopStore.getCartItemQuantity(
      item,
      storeName,
    );
    const itemStock = item.stock;

    this.state = {
      loading: this.props.item.image ? true : false,
      addButtonDisabled: itemQuantity >= itemStock ? true : false,
      minusButtonShown: itemQuantity > 0 ? true : false,
      writeTimer: null,
      overlay: false,
    };
  }

  @observable url = null;

  @computed get cartItemQuantity() {
    const {item, storeName} = this.props;

    if (this.props.shopStore.storeCartItems) {
      if (this.props.shopStore.storeCartItems[storeName]) {
        const cartItem = this.props.shopStore.storeCartItems[storeName].find(
          (storeCartItem) => storeCartItem.name === item.name,
        );

        if (cartItem) {
          if (cartItem.quantity > 0 && !this.state.minusButtonShown) {
            this.showMinusButton();
          }

          return cartItem.quantity;
        }
      }
    }

    if (this.state.minusButtonShown) {
      this.hideMinusButton();
    }

    return 0;
  }

  @computed get cartItemIndex() {
    const {item, storeName} = this.props;

    if (this.props.shopStore.storeCartItems) {
      if (this.props.shopStore.storeCartItems[storeName]) {
        const itemIndex = this.props.shopStore.storeCartItems[
          storeName
        ].findIndex((storeCartItem) => storeCartItem.name === item.name);

        if (itemIndex >= 0) {
          return itemIndex;
        }
      }
    }

    return 0;
  }

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref.getDownloadURL();
    this.url = link;
  };

  componentDidMount() {
    if (this.props.item.image) {
      this.getImage()
        .then(() => {
          this.setState({loading: false});
        })
        .then(() => {
          if (this.cartItemQuantity >= 1) {
            this.showMinusButton();
          }
        });
    }
  }

  showMinusButton() {
    if (this.buttonCounterView && this.plusButton) {
      this.setState({minusButtonShown: true});
      this.buttonCounterView.fadeInRight(200) &&
        this.plusButton.transformPlusButton(300);
    }
  }

  hideMinusButton() {
    this.setState({minusButtonShown: false});

    if (this.buttonCounterView && this.plusButton) {
      this.buttonCounterView.fadeOutRight(200) &&
        this.plusButton.deTransformPlusButton(300);
    }
  }

  handleIncreaseQuantity() {
    const {item, storeName} = this.props;

    this.props.shopStore.addCartItemToStorage(item, storeName);

    if (this.cartItemQuantity < item.stock) {
      if (!this.props.authStore.guest) {
        clearTimeout(this.props.shopStore.cartUpdateTimeout);

        this.props.shopStore.cartUpdateTimeout = setTimeout(() => {
          this.props.shopStore.updateCartItems();
        }, 2500);
      }
    }

    this.cartItemQuantity === parseInt(item.stock, 10) &&
      this.setState({addButtonDisabled: true});

    if (!this.state.minusButtonShown && this.cartItemQuantity >= 1) {
      this.showMinusButton();
    }
  }

  handleDecreaseQuantity() {
    const {item, storeName} = this.props;

    this.props.shopStore.deleteCartItemInStorage(item, storeName);

    if (!this.props.authStore.guest) {
      clearTimeout(this.props.shopStore.cartUpdateTimeout);

      this.props.shopStore.cartUpdateTimeout = setTimeout(() => {
        this.props.shopStore.updateCartItems();
      }, 2500);
    }

    if (this.cartItemQuantity <= 0 && this.state.minusButtonShown) {
      this.hideMinusButton();
    }

    this.cartItemQuantity <= item.stock &&
      this.setState({addButtonDisabled: false});
  }

  render() {
    const {name, price, stock, unit, description} = this.props.item;

    const {addButtonDisabled, loading} = this.state;

    if (!loading) {
      return (
        <Animatable.View
          useNativeDriver
          animation="fadeIn"
          duration={350}
          style={{
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 6,
            marginVertical: 3,
          }}>
          <ItemDescriptionModal
            isVisible={this.state.overlay}
            onBackdropPress={() => this.setState({overlay: false})}
            description={description}
            name={name}
            price={price}
            unit={unit}
            stock={stock}
            url={this.url}
          />

          <Card
            style={{
              borderRadius: 10,
              overflow: 'hidden',
            }}>
            <View
              style={{
                backgroundColor: colors.icons,
                paddingHorizontal: 10,
                paddingVertical: 10,
                elevation: 2,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
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
                      style={{
                        color: colors.text_secondary,
                        fontFamily: 'ProductSans-Regular',
                      }}>
                      {name}
                    </Text>

                    <Text
                      style={{
                        color: colors.text_primary,
                        fontFamily: 'ProductSans-Black',
                      }}>
                      ₱{price}/{unit}
                    </Text>
                  </View>

                  <View style={{width: 30}}>
                    <Icon name="info" color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <CardItem cardBody>
              {this.url ? (
                <FastImage
                  source={{uri: this.url}}
                  style={{
                    aspectRatio: 1,
                    flex: 1,
                    backgroundColor: '#e1e4e8',
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              ) : (
                <FastImage
                  source={require('../../assets/images/placeholder.jpg')}
                  style={{
                    aspectRatio: 1,
                    flex: 1,
                    backgroundColor: '#e1e4e8',
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )}

              <View
                style={{
                  flexDirection: 'row',
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  backgroundColor: colors.icons,
                  opacity: 0.9,
                  borderColor: colors.text_secondary,
                  padding: 5,
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 14}}>{stock}</Text>

                <Text
                  style={{
                    fontSize: 14,
                    textAlign: 'center',
                    color: colors.text_secondary,
                  }}>
                  {' '}
                  Left
                </Text>
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
              <Animatable.View
                ref={(buttonCounterView) =>
                  (this.buttonCounterView = buttonCounterView)
                }
                useNativeDriver
                style={{
                  flexDirection: 'row',
                  opacity: 0,
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 24,
                  borderBottomLeftRadius: 24,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 1.84,
                  elevation: 2,
                }}>
                <View
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 1.84,
                    paddingRight: 4,
                  }}>
                  <Button
                    onPress={() => this.handleDecreaseQuantity()}
                    type="clear"
                    color={colors.icons}
                    icon={<Icon name="minus" color={colors.primary} />}
                    containerStyle={[
                      styles.buttonContainer,
                      {
                        backgroundColor: '#fff',
                        height: 40,
                        borderRadius: 24,
                        elevation: 3,
                      },
                    ]}
                  />
                </View>

                <View
                  style={{
                    backgroundColor: '#fff',
                    height: 40,
                    width: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontFamily: 'ProductSans-Black',
                      paddingRight: 4,
                    }}>
                    {this.cartItemQuantity}
                  </Text>
                </View>
              </Animatable.View>

              <Animatable.View
                ref={(plusButton) => (this.plusButton = plusButton)}
                useNativeDriver
                style={[
                  styles.buttonContainer,
                  {
                    borderRadius: 24,
                    backgroundColor: '#fff',
                    height: 40,
                    elevation: 2,
                  },
                ]}>
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
                    disabled={addButtonDisabled}
                    type="clear"
                    color={colors.icons}
                    icon={
                      <Icon
                        name="plus"
                        color={
                          addButtonDisabled
                            ? colors.text_secondary
                            : colors.primary
                        }
                      />
                    }
                    containerStyle={[
                      styles.buttonContainer,
                      {
                        backgroundColor: '#fff',
                        height: 40,
                        borderRadius: 24,
                        elevation: 3,
                      },
                    ]}
                  />
                </View>
              </Animatable.View>
            </View>
          </Card>
        </Animatable.View>
      );
    }

    return (
      <Animatable.View
        useNativeDriver
        animation="fadeInUp"
        duration={350}
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
          <ItemCardLoader />
        </Card>
      </Animatable.View>
    );
  }
}

export default ItemCard;
