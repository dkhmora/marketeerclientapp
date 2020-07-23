import React, {Component} from 'react';
import FastImage from 'react-native-fast-image';
import {Card, Text, ListItem, Button, Icon} from 'react-native-elements';
import {observable, computed} from 'mobx';
import storage from '@react-native-firebase/storage';
import {View, Image} from 'react-native';
import {observer, inject} from 'mobx-react';
import {styles} from '../../assets/styles';
import {colors} from '../../assets/colors';

@inject('shopStore')
@inject('authStore')
@observer
class CartListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/images/placeholder.jpg'),
    };
  }

  @computed get addButtonDisabled() {
    const {item} = this.props;

    return item.quantity >= item.stock;
  }

  @observable url = null;

  handleIncreaseQuantity() {
    const {item, merchantId} = this.props;

    this.props.shopStore.addCartItemToStorage(item, merchantId);

    if (!this.addButtonDisabled) {
      this.props.shopStore.updateCartItems();
    }
  }

  handleDecreaseQuantity() {
    const {item, merchantId} = this.props;

    this.props.shopStore.deleteCartItemInStorage(item, merchantId);

    this.props.shopStore.updateCartItems();
  }

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref.getDownloadURL();
    this.setState({url: {uri: link}});
  };

  componentDidMount() {
    if (this.props.item.image) {
      this.getImage();
    }
  }

  render() {
    const {item, checkout} = this.props;
    const {url} = this.state;

    return (
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 8,
          paddingHorizontal: 10,
        }}>
        <FastImage
          key={item.name}
          source={url}
          style={{
            height: 55,
            width: 55,
            borderColor: colors.primary,
            borderWidth: 1,
            borderRadius: 10,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
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
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginRight: 10,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              borderRadius: 30,
            }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#fff',
                borderRadius: 30,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  elevation: 3,
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
                  icon={<Icon name="minus" color={colors.primary} size={15} />}
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
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'ProductSans-Black',
                  }}>
                  {item.quantity}
                </Text>
              </View>

              <View
                style={{
                  elevation: 3,
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
            ₱{item.price}
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
            ₱{item.price * item.quantity}
          </Text>
        </View>
      </View>
    );
  }
}

export default CartListItem;
