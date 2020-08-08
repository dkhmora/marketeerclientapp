import React, {Component} from 'react';
import {Overlay, Text} from 'react-native-elements';
import {View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';

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
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View>
          {url ? (
            <FastImage
              source={{uri: url}}
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                width: null,
                height: 300,
                aspectRatio: 1,
                backgroundColor: colors.primary,
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
                height: 300,
                aspectRatio: 1,
                backgroundColor: colors.primary,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.icons,
              elevation: 10,
              marginTop: -10,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'ProductSans-Regular',
              }}>
              {name}
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {discountedPrice && (
                <Text
                  style={{
                    textDecorationLine: 'line-through',
                    textDecorationStyle: 'solid',
                    color: colors.text_secondary,
                    fontSize: 16,
                    marginRight: 5,
                  }}>
                  ₱{price}
                </Text>
              )}

              <Text
                style={{
                  color: colors.text_primary,
                  fontFamily: 'ProductSans-Black',
                  fontSize: 18,
                }}>
                ₱{discountedPrice ? discountedPrice : price}/{unit}
              </Text>
            </View>

            <View style={{padding: 10, marginBottom: 20}}>
              <Text style={{fontSize: 18}}>{description}</Text>
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
              <Text style={{fontSize: 16}}>{stock}</Text>

              <Text
                style={{
                  fontSize: 16,
                  textAlign: 'center',
                  color: colors.text_secondary,
                }}>
                {' '}
                Left
              </Text>
            </View>
          </View>
        </View>
      </Overlay>
    );
  }
}

export default ItemDescriptionModal;
