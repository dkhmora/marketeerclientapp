import React, {Component} from 'react';
import {Text, Button} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {View} from 'react-native';
import {Card, CardItem} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayImageUrl: null,
      coverImageUrl: null,
    };
  }

  getImage = async () => {
    const {displayImage, coverImage} = this.props.store;

    const displayImageRef = storage().ref(displayImage);
    const coverImageRef = storage().ref(coverImage);
    const coverImageUrl = await coverImageRef.getDownloadURL();
    const displayImageUrl = await displayImageRef.getDownloadURL();

    this.setState({displayImageUrl, coverImageUrl});
  };

  componentDidMount() {
    this.getImage();
  }

  render() {
    const {store} = this.props;
    const {displayImageUrl, coverImageUrl} = this.state;

    console.log('store', store);

    return (
      <Card
        style={{
          padding: 0,
          margin: 0,
          borderRadius: 8,
          elevation: 2,
        }}>
        {{coverImageUrl} && (
          <View style={{height: 200}}>
            <FastImage
              source={{uri: coverImageUrl}}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 200,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
              resizeMode={FastImage.resizeMode.center}
            />
            <Button
              containerStyle={{
                position: 'absolute',
                right: 0,
                width: 60,
                marginTop: 20,
              }}
              title="yes"></Button>
          </View>
        )}
        <CardItem
          style={{
            flexDirection: 'column',
            width: '100%',
            height: 100,
            borderRadius: 8,
            position: 'relative',
            bottom: 30,
            marginBottom: -30,
          }}>
          <Text
            style={[
              styles.text_footer,
              {
                fontFamily: 'ProductSans-Regular',
                textAlign: 'left',
                alignSelf: 'flex-start',
              },
            ]}>
            {store.storeName}
          </Text>
          <Text
            style={[
              styles.text_subtext,
              {
                fontFamily: 'ProductSans-light',
                textAlign: 'left',
                alignSelf: 'flex-start',
              },
            ]}>
            {store.storeDescription}
          </Text>
          <Text>{store.storeCategory}</Text>
          <Text>{store.deliveryDescription}</Text>
        </CardItem>
        {{displayImageUrl} && (
          <FastImage
            source={{uri: displayImageUrl}}
            style={{
              position: 'absolute',
              top: 100,
              left: 30,
              width: 80,
              height: 80,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
            resizeMode={FastImage.resizeMode.center}
          />
        )}
      </Card>
    );
  }
}

export default StoreCard;
