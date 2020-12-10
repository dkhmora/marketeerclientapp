import React, {Component} from 'react';
import {Text, Icon} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import {View, TouchableOpacity} from 'react-native';
import {Card, CardItem} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {PlaceholderMedia, Placeholder, Fade} from 'rn-placeholder';
import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {CDN_BASE_URL} from '../util/variables';
import {getStoreAvailability, getNextStoreOperationDate} from '../util/helpers';
import Pill from './Pill';

@observer
class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coverImageReady: false,
      displayImageReady: false,
    };
  }

  @computed get paymentMethods() {
    const {store} = this.props;

    if (store) {
      const {availablePaymentMethods} = store;

      if (availablePaymentMethods) {
        return Object.entries(availablePaymentMethods)
          .filter(([key, value]) => value.activated)
          .map(([key, value]) => key)
          .sort((a, b) => a > b);
      }
    }

    return [];
  }

  @computed get storeAvailable() {
    const {
      store: {storeHours, vacationMode},
    } = this.props;

    return getStoreAvailability(storeHours, vacationMode);
  }

  PaymentMethods = () => {
    const {paymentMethods} = this;
    const pills = [];

    paymentMethods &&
      paymentMethods.map((method, index) => {
        pills.push(<Pill key={`${method}${index}`} title={method} />);
      });

    return pills;
  };

  render() {
    const {
      props: {
        store,
        store: {
          storeName,
          storeDescription,
          displayImage,
          coverImage,
          vacationMode,
          deliveryType,
          deliveryDiscount,
          storeCategory,
          ratingAverage,
          distance,
          storeHours,
        },
        navigation,
      },
      storeAvailable,
    } = this;
    const {coverImageReady, displayImageReady} = this.state;
    const displayImageUrl = `${CDN_BASE_URL}${displayImage}`;
    const coverImageUrl = `${CDN_BASE_URL}${coverImage}`;
    const nextStoreOperationDateText = getNextStoreOperationDate(storeHours);

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
            activeOpacity={storeAvailable ? 0.9 : 1}
            style={{backgroundColor: colors.icons}}
            onPress={() =>
              storeAvailable &&
              navigation.navigate('Store', {
                store,
                displayImageUrl,
                coverImageUrl,
              })
            }>
            <View style={{height: 200}}>
              <FastImage
                source={{uri: coverImageUrl}}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 150,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  opacity: coverImageReady ? 1 : 0,
                }}
                resizeMode={FastImage.resizeMode.cover}
                onLoad={() => this.setState({coverImageReady: true})}
              />

              {!coverImageReady && (
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
                  borderTopLeftRadius: 3,
                  borderBottomLeftRadius: 3,
                  right: -1,
                  top: 10,
                  padding: 4,
                  backgroundColor: colors.accent,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 3,
                }}>
                <Text style={{color: colors.icons}}>{deliveryType}</Text>

                {deliveryDiscount && deliveryDiscount.activated && (
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        height: 1,
                        width: '70%',
                        backgroundColor: colors.icons,
                        marginVertical: 3,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Icon
                        name="gift"
                        color={colors.icons}
                        size={11}
                        style={{marginRight: 4}}
                      />
                      <Text
                        style={{
                          color: colors.icons,
                          fontFamily: 'ProductSans-Black',
                        }}>
                        Delivery Promo
                      </Text>
                    </View>
                  </View>
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
                  elevation: 3,
                }}>
                <Text style={{color: colors.icons}}>{storeCategory}</Text>
              </View>

              {!storeAvailable && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 150,
                    backgroundColor: 'transparent',
                    elevation: 4,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: colors.icons,
                        fontFamily: 'ProductSans-Bold',
                        fontSize: 16,
                        backgroundColor: colors.primary,
                        paddingHorizontal: 5,
                        paddingVertical: 2,
                        borderRadius: 10,
                        elevation: 5,
                        zIndex: 10,
                        overflow: 'hidden',
                      }}>
                      {vacationMode || !nextStoreOperationDateText
                        ? 'Currently Unavailable'
                        : `Opens on ${nextStoreOperationDateText}`}
                    </Text>
                  </View>
                </View>
              )}
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
                backgroundColor: colors.icons,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
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
                    {storeName}
                  </Text>

                  {ratingAverage && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: colors.text_primary}}>
                        {ratingAverage.toFixed(1)}
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
                  {storeDescription}
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
                    {distance
                      ? distance > 1000
                        ? `${(distance / 1000).toFixed(2)} km`
                        : `${distance} meters`
                      : ''}
                  </Text>
                </View>
              </View>
            </CardItem>

            <View
              style={{
                position: 'absolute',
                top: 95,
                left: 20,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 6,
                borderRadius: 8,
                borderWidth: 0.7,
                borderColor: 'rgba(0,0,0,0.3)',
                overflow: 'hidden',
                width: 60,
                height: 60,
              }}>
              <FastImage
                source={{uri: displayImageUrl}}
                style={{
                  width: 60,
                  height: 60,
                  opacity: displayImageReady ? 1 : 0,
                }}
                resizeMode={FastImage.resizeMode.cover}
                onLoad={() => this.setState({displayImageReady: true})}
                visibility={displayImageReady ? null : 'hidden'}
              />

              {!displayImageReady && (
                <Placeholder Animation={Fade}>
                  <PlaceholderMedia
                    style={{
                      backgroundColor: colors.primary,
                      width: 60,
                      height: 60,
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
