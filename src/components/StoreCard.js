import React, {Component} from 'react';
import {Text, Rating} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
} from 'react-native';
import {Card, CardItem} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayImageUrl: '',
      coverImageUrl: '',
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

  PaymentMethods = () => {
    const {paymentMethods} = this.props.store;
    const pills = [];

    paymentMethods.map((method, index) => {
      pills.push(
        <View
          key={index}
          style={{
            borderRadius: 20,
            backgroundColor: colors.accent,
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
            {method}
          </Text>
        </View>,
      );
    });

    return pills;
  };

  render() {
    const {store} = this.props;
    const {displayImageUrl, coverImageUrl} = this.state;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => console.log('yessss')}>
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
                resizeMode={FastImage.resizeMode.cover}
              />
              <View
                style={{
                  flexDirection: 'column',
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
                  {store.deliveryType}
                </Text>
                {store.freeDelivery && (
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    Free Delivery
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  borderTopLeftRadius: 8,
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
                  bottom: 60,
                  right: 0,
                  padding: 5,
                  backgroundColor: colors.primary,
                }}>
                <Rating
                  type="custom"
                  fractions={1}
                  startingValue={3.3}
                  imageSize={20}
                  ratingImage={require('../../assets/images/star.png')}
                  readonly
                  tintColor={colors.primary}
                  ratingColor={colors.accent}
                  ratingBackgroundColor="#455A64"
                />
              </View>
            </View>
          )}
          <CardItem
            style={{
              flexDirection: 'column',
              width: '100%',
              height: 65,
              borderRadius: 8,
              paddingBottom: 20,
              position: 'relative',
              bottom: 40,
            }}>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.text_footer,
                  {
                    fontFamily: 'ProductSans-Regular',
                    flex: 1,
                    textAlign: 'left',
                    alignSelf: 'flex-start',
                  },
                ]}>
                {store.storeName}
              </Text>
            </View>

            <View>
              <Text
                numberOfLines={2}
                style={[
                  styles.text_subtext,
                  {
                    fontFamily: 'ProductSans-light',
                    textAlign: 'left',
                    alignSelf: 'flex-start',
                    flex: 1,
                  },
                ]}>
                {store.storeDescription}
              </Text>
            </View>

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                marginTop: 5,
              }}>
              <this.PaymentMethods />
            </View>
          </CardItem>
          {{displayImageUrl} && (
            <FastImage
              source={{uri: displayImageUrl}}
              style={{
                position: 'absolute',
                bottom: 95,
                left: 20,
                width: 80,
                height: 80,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.primary,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
        </Card>
      </TouchableOpacity>
    );
  }
}

export default StoreCard;

const platformStyle = StyleSheet.create({
  storeDescriptionText: {
    flexWrap: Platform.OS === 'android' ? 'wrap' : 'nowrap',
    flexShrink: Platform.OS === 'android' ? 1 : 0,
  },
  storeDescriptionContainer: {
    paddingBottom: Platform.OS === 'android' ? 10 : 0,
  },
});
