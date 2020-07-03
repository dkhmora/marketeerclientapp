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
                backgroundColor: '#e1e4e8',
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <FastImage
              source={require('../../assets/images/placeholder.jpg')}
              style={{
                height: 150,
                width: null,
                backgroundColor: '#e1e4e8',
              }}
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
            <Text
              style={{
                color: colors.text_primary,
                fontSize: 18,
                fontFamily: 'ProductSans-Black',
              }}>
              ₱{price}/{unit}
            </Text>

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
