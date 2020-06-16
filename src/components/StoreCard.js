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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                borderColor: 'rgba(0,0,0,0.3)',
                borderWidth: 1,
                right: -1,
                padding: 7,
                marginTop: 20,
                backgroundColor: colors.icons,
              }}>
              <Text style={{color: colors.text_primary}}>
                Same Day Delivery
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                borderBottomRightRadius: 8,
                top: 0,
                left: 0,
                padding: 7,
                backgroundColor: colors.primary,
              }}>
              <Text style={{color: colors.icons, fontSize: 17}}>
                {store.storeCategory}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                bottom: 30,
                right: 0,
                height: 30,
                padding: 10,
                backgroundColor: colors.primary,
              }}>
              <Text style={{color: colors.icons, fontSize: 17}}>
                Rating(Stars)
              </Text>
            </View>
          </View>
        )}
        <CardItem
          style={{
            flexDirection: 'column',
            width: '100%',
            height: 100,
            borderRadius: 8,
            position: 'relative',
            bottom: 10,
            marginBottom: -10,
          }}>
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              marginBottom: 5,
            }}>
            <Text
              style={[
                styles.text_footer,
                {
                  fontFamily: 'ProductSans-Regular',
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                  marginRight: 5,
                },
              ]}>
              {store.storeName}
            </Text>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: colors.primary,
                padding: 3,
                paddingHorizontal: 10,
                marginRight: 2,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'ProductSans-Regular',
                  color: colors.icons,
                }}>
                COD
              </Text>
            </View>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: colors.primary,
                padding: 3,
                paddingHorizontal: 10,
                marginRight: 2,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'ProductSans-Regular',
                  color: colors.icons,
                }}>
                Credit Card
              </Text>
            </View>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: colors.primary,
                padding: 3,
                paddingHorizontal: 10,
                marginRight: 2,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'ProductSans-Regular',
                  color: colors.icons,
                }}>
                Debit Card
              </Text>
            </View>
          </View>

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
              borderRadius: 8,
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
