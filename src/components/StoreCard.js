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

    paymentMethods &&
      paymentMethods.map((method, index) => {
        pills.push(
          <View
            key={`${method}${index}`}
            style={{
              borderRadius: 20,
              backgroundColor: colors.accent,
              padding: 2,
              paddingHorizontal: 5,
              marginRight: 2,
            }}>
            <Text
              style={{
                fontSize: 12,
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
          flex: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          paddingHorizontal: 5,
        }}>
        <Card
          style={{
            padding: 0,
            margin: 0,
            borderRadius: 8,
            elevation: 2,
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
                  borderColor: 'rgba(0,0,0,0.2)',
                  borderWidth: 1,
                  right: -1,
                  padding: 4,
                  marginTop: 20,
                  backgroundColor: colors.icons,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
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
                  padding: 4,
                  backgroundColor: colors.primary,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.34,
                  shadowRadius: 6.27,
                  elevation: 10,
                }}>
                <Text style={{color: colors.icons}}>{store.storeCategory}</Text>
              </View>
            </View>

            <CardItem
              style={{
                flexDirection: 'column',
                width: '100%',
                marginTop: -55,
                borderRadius: 8,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 10,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  paddingTop: 5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.text_footer,
                      {
                        fontFamily: 'ProductSans-Regular',
                        textAlign: 'left',
                        alignSelf: 'flex-start',
                        flexWrap: 'wrap',
                        flex: 1,
                      },
                    ]}>
                    {store.storeName}
                  </Text>

                  {store.ratingAverage && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: colors.text_primary}}>
                        {store.ratingAverage.toFixed(1)}
                      </Text>

                      <FastImage
                        source={require('../../assets/images/feather_filled.png')}
                        style={{
                          backgroundColor: colors.icons,
                          width: 17,
                          height: 17,
                          marginLeft: 5,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  )}
                </View>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.text_subtext,
                    {
                      fontSize: 12,
                      fontFamily: 'ProductSans-light',
                      flexWrap: 'wrap',
                      minHeight: 28,
                    },
                  ]}>
                  {store.storeDescription}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    paddingTop: 5,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}>
                    <this.PaymentMethods />
                  </View>

                  <Text style={{color: colors.text_secondary, fontSize: 12}}>
                    {store.distance
                      ? store.distance > 1000
                        ? `${(store.distance / 1000).toFixed(2)} km`
                        : `${store.distance} meters`
                      : ''}
                  </Text>
                </View>
              </View>
            </CardItem>

            <View
              style={{
                position: 'absolute',
                top: 80,
                left: 20,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                backgroundColor: colors.primary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.primary,
                overflow: 'hidden',
                width: 80,
                height: 80,
              }}>
              {displayImageUrl && ready ? (
                <FastImage
                  source={{uri: displayImageUrl}}
                  style={{
                    backgroundColor: colors.primary,
                    width: 80,
                    height: 80,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Placeholder Animation={Fade}>
                  <PlaceholderMedia
                    style={{
                      backgroundColor: colors.primary,
                      width: 80,
                      height: 80,
                    }}
                  />
                </Placeholder>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }
}

export default StoreCard;
