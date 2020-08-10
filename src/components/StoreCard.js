import React, {Component} from 'react';
import {Text} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {View, TouchableOpacity} from 'react-native';
import {Card, CardItem} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {Rating} from 'react-native-rating-element';
import {PlaceholderMedia, Placeholder, Fade} from 'rn-placeholder';

class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayImageUrl: '',
      coverImageUrl: '',
      ready: false,
    };
  }

  getImage = async () => {
    const {displayImage, coverImage} = this.props.store;

    const displayImageRef = storage().ref(displayImage);
    const coverImageRef = storage().ref(coverImage);
    const coverImageUrl = await coverImageRef.getDownloadURL();
    const displayImageUrl = await displayImageRef.getDownloadURL();

    this.setState({displayImageUrl, coverImageUrl, ready: true});
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
          key={`${method}${index}`}
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
    const {store, navigation} = this.props;
    const {displayImageUrl, coverImageUrl, ready} = this.state;

    return (
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
            padding: 0,
            margin: 0,
            borderRadius: 8,
            elevation: 2,
            height: 266,
            overflow: 'hidden',
          }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Store', {
                store,
                displayImageUrl,
                coverImageUrl,
              })
            }>
            <View style={{height: 200}}>
              {coverImageUrl && ready ? (
                <FastImage
                  source={{uri: coverImageUrl}}
                  style={{
                    backgroundColor: colors.primary,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 150,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Placeholder Animation={Fade}>
                  <PlaceholderMedia
                    style={{
                      backgroundColor: colors.primary,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      width: '100%',
                      height: 150,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </Placeholder>
              )}

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
                    Free Delivery (₱
                    {store.freeDeliveryMinimum
                      ? store.freeDeliveryMinimum
                      : 0}{' '}
                    Min.)
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
                  elevation: 10,
                  padding: 7,
                  backgroundColor: colors.primary,
                }}>
                <Text style={{color: colors.icons, fontSize: 17}}>
                  {store.storeCategory}
                </Text>
              </View>

              {store.ratingAverage && (
                <View
                  style={{
                    overflow: 'hidden',
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
                    direction="row"
                    rated={store.ratingAverage}
                    selectedIconImage={require('../../assets/images/feather_filled.png')}
                    emptyIconImage={require('../../assets/images/feather_unfilled.png')}
                    size={23}
                    tintColor={colors.primary}
                    ratingColor={colors.accent}
                    ratingBackgroundColor="#455A64"
                    readonly
                  />
                </View>
              )}
            </View>

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
                  width: '100%',
                  flexDirection: 'column',
                }}>
                <Text
                  numberOfLines={1}
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
                  numberOfLines={2}
                  style={[
                    styles.text_subtext,
                    {
                      fontFamily: 'ProductSans-light',
                      textAlign: 'left',
                      alignSelf: 'flex-start',
                      height: 32,
                    },
                  ]}>
                  {store.storeDescription}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: 5,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}>
                    <this.PaymentMethods />
                  </View>

                  <Text style={{color: colors.text_secondary}}>
                    {store.distance
                      ? store.distance > 1000
                        ? `${(store.distance / 1000).toFixed(2)} km`
                        : `${store.distance} meters`
                      : ''}
                  </Text>
                </View>
              </View>
            </CardItem>

            {displayImageUrl && ready ? (
              <FastImage
                source={{uri: displayImageUrl}}
                style={{
                  backgroundColor: colors.primary,
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
            ) : (
              <Placeholder Animation={Fade}>
                <PlaceholderMedia
                  style={{
                    backgroundColor: colors.primary,
                    position: 'absolute',
                    bottom: 95,
                    left: 20,
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                />
              </Placeholder>
            )}
          </TouchableOpacity>
        </Card>
      </View>
    );
  }
}

export default StoreCard;
