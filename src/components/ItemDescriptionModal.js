import React, {Component} from 'react';
import {Overlay, Text} from 'react-native-elements';
import {View} from 'react-native';
import FastImage from 'react-native-fast-image';

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
      ...otherProps
    } = this.props;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={onBackdropPress}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="70%"
        height="auto"
        overlayStyle={{borderRadius: 10}}>
        <View>
          {url ? (
            <FastImage
              source={{uri: url}}
              style={{
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
          <View style={{paddingHorizontal: 5, paddingVertical: 10}}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'ProductSans-Regular',
                paddingBottom: 5,
              }}>
              {name}
            </Text>

            <View style={{padding: 10}}>
              <Text style={{fontSize: 18}}>{description}</Text>
            </View>
          </View>
        </View>
      </Overlay>
    );
  }
}

export default ItemDescriptionModal;
