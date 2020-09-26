import React, {Component} from 'react';
import {Overlay, Text} from 'react-native-elements';
import {View, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';

const SCREEN_WIDTH = Dimensions.get('screen').width * 0.8;
class ItemDescriptionModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isVisible,
      onBackdropPress,
      description,
      name,
      url,
      discountedPrice,
      price,
      unit,
      stock,
      ...otherProps
    } = this.props;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={onBackdropPress}
        animationType="fade"
        statusBarTranslucent
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View style={{alignItems: 'center', maxWidth: SCREEN_WIDTH}}>
          <View style={{elevation: 5, borderRadius: 10, overflow: 'hidden'}}>
            {url ? (
              <FastImage
                source={{uri: url}}
                style={{
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  width: null,
                  height: SCREEN_WIDTH,
                  aspectRatio: 1,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <FastImage
                source={require('../../assets/images/placeholder.jpg')}
                style={{
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  width: null,
                  height: SCREEN_WIDTH,
                  aspectRatio: 1,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            )}
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingBottom: 10,
              paddingTop: 15,
              backgroundColor: colors.icons,
              marginTop: -10,
              width: '100%',
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}>
            <Text
              maxFontSizeMultiplier={1.5}
              style={{
                fontSize: 24,
                fontFamily: 'ProductSans-Regular',
              }}>
              {name}
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {discountedPrice ? (
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={{
                    textDecorationLine: 'line-through',
                    textDecorationStyle: 'solid',
                    color: colors.text_secondary,
                    fontSize: 16,
                    marginRight: 5,
                  }}>
                  ₱{price}
                </Text>
              ) : null}

              <Text
                maxFontSizeMultiplier={1.5}
                style={{
                  color: colors.text_primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 18,
                }}>
                ₱{discountedPrice ? discountedPrice : price}
                {unit ? `/${unit}` : null}
              </Text>
            </View>

            <View
              style={{
                padding: 10,
                marginBottom: 20,
              }}>
              {description ? (
                <Text maxFontSizeMultiplier={1.5} style={{fontSize: 18}}>
                  {description}
                </Text>
              ) : (
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={{fontSize: 14, color: colors.text_secondary}}>
                  No description
                </Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                borderRadius: 10,
                borderWidth: 1,
                backgroundColor: colors.icons,
                opacity: 0.9,
                borderColor: colors.text_secondary,
                padding: 5,
                alignItems: 'center',
                alignSelf: 'flex-end',
              }}>
              {stock > 0 ? (
                <View style={{flexDirection: 'row'}}>
                  <Text maxFontSizeMultiplier={1.5} style={{fontSize: 16}}>
                    {stock}
                  </Text>

                  <Text
                    maxFontSizeMultiplier={1.5}
                    style={{
                      fontSize: 16,
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
                    fontSize: 16,
                    textAlign: 'center',
                    color: colors.danger,
                  }}>
                  Out of Stock
                </Text>
              )}
            </View>
          </View>
        </View>
      </Overlay>
    );
  }
}

export default ItemDescriptionModal;
