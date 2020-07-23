import React, {Component} from 'react';
import {Overlay, Text, Avatar, ButtonGroup, Icon} from 'react-native-elements';
import {View, ActivityIndicator, FlatList, ImageBackground} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import {inject} from 'mobx-react';
import {CardItem, Card} from 'native-base';
import {Rating} from 'react-native-rating-element';
import MapView, {Marker} from 'react-native-maps';
import moment, {ISO_8601} from 'moment';

@inject('generalStore')
class StoreDetailsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reviewsLoading: true,
      reviews: [],
      selectedIndex: 0,
    };
  }

  handleBackdropPress() {
    const {closeModal} = this.props;

    closeModal();
  }

  async getReviews() {
    const {store} = this.props;
    const {reviews} = this.state;

    if (reviews.length <= 0) {
      this.setState(
        {
          reviews: await this.props.generalStore.getStoreReviews(
            store.merchantId,
          ),
        },
        () => {
          this.setState({reviewsLoading: false});
        },
      );
    }
  }

  ReviewListItem({item}) {
    const timeStamp = moment(item.createdAt, 'x').format('MM-DD-YYYY hh:mm A');

    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          paddingVertical: 10,
          borderBottomColor: colors.divider,
          borderBottomWidth: 1,
          paddingHorizontal: 15,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Avatar
              title={item.userName.charAt(0)}
              size="small"
              rounded
              overlayContainerStyle={{
                backgroundColor: colors.primary,
              }}
              onPress={() => console.log('Works!')}
              activeOpacity={0.7}
              titleStyle={{
                fontFamily: 'ProductSans-Light',
                color: colors.icons,
              }}
            />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 17,
                fontFamily: 'ProductSans-Regular',
              }}>
              {item.userName}
            </Text>
          </View>

          <Rating
            type="custom"
            direction="row"
            rated={item.rating}
            selectedIconImage={require('../../assets/images/feather_filled.png')}
            emptyIconImage={require('../../assets/images/feather_unfilled.png')}
            size={20}
            tintColor={colors.primary}
            ratingColor={colors.accent}
            ratingBackgroundColor="#455A64"
            onIconTap={() => {}}
          />
        </View>

        <View style={{paddingHorizontal: 8, paddingTop: 8}}>
          <Text style={{fontSize: 15, paddingBottom: 10, textAlign: 'justify'}}>
            {item.reviewBody}
          </Text>

          <Text style={{color: colors.text_secondary}}>{timeStamp}</Text>
        </View>
      </View>
    );
  }

  render() {
    const {
      isVisible,
      closeModal,
      store,
      displayImageUrl,
      coverImageUrl,
      ...otherProps
    } = this.props;
    const {reviewsLoading, reviews, selectedIndex} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onShow={() => this.getReviews()}
        onBackdropPress={() => this.handleBackdropPress()}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="90%"
        height="70%"
        overlayStyle={{
          borderRadius: 10,
          padding: 0,
          marginHorizontal: '5%',
          marginVertical: '20%',
        }}>
        <View style={{flex: 1}}>
          <View>
            {coverImageUrl && (
              <ImageBackground
                source={{uri: coverImageUrl}}
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  height: 200,
                  aspectRatio: 3,
                  elevation: 10,
                  resizeMode: 'stretch',
                  alignItems: 'center',
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.34,
                  shadowRadius: 6.27,
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    paddingHorizontal: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                    {displayImageUrl && (
                      <FastImage
                        source={{uri: displayImageUrl}}
                        style={{
                          borderRadius: 10,
                          width: 90,
                          aspectRatio: 1,
                          backgroundColor: '#e1e4e8',
                          elevation: 10,
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 5,
                          },
                          shadowOpacity: 0.34,
                          shadowRadius: 6.27,
                          marginRight: 10,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    )}

                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          color: colors.icons,
                          fontSize: 24,
                          marginBottom: 10,
                        }}>
                        {store.storeName}
                      </Text>
                      <Text
                        style={{
                          color: colors.icons,
                          fontSize: 16,
                          flexWrap: 'wrap',
                        }}>
                        {store.storeDescription}
                      </Text>
                    </View>
                  </View>

                  <View style={{justifyContent: 'center'}}>
                    <ButtonGroup
                      onPress={(index) => this.setState({selectedIndex: index})}
                      selectedIndex={selectedIndex}
                      buttons={['Store Info', 'Reviews']}
                      activeOpacity={0.7}
                      containerStyle={{
                        height: 30,
                        width: '80%',
                        borderRadius: 8,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        borderColor: 'rgba(0,0,0,0.7)',
                      }}
                      selectedButtonStyle={{backgroundColor: colors.primary}}
                    />
                  </View>
                </View>
              </ImageBackground>
            )}
          </View>

          {selectedIndex === 1 ? (
            <View style={{flex: 1, overflow: 'hidden'}}>
              {reviewsLoading ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  style={{flex: 1, overflow: 'hidden'}}
                  contentContainerStyle={{flexGrow: 1}}
                  data={reviews}
                  initialNumToRender={30}
                  renderItem={({item, index}) => (
                    <this.ReviewListItem item={item} key={index} />
                  )}
                  ListEmptyComponent={
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 20,
                          textAlign: 'center',
                          paddingHorizontal: 15,
                        }}>
                        This store has no reviews yet.
                      </Text>
                    </View>
                  }
                  keyExtractor={(item) => item.orderId}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
              }}>
              <View
                style={{
                  flex: 0.1,
                  paddingHorizontal: 15,
                  paddingVertical: 20,
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    name="map-pin"
                    color={colors.primary}
                    style={{paddingRight: 10}}
                  />
                  <Text style={{fontSize: 16}}>
                    {store.deliveryCoordinates.address}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 0.9,
                  overflow: 'hidden',
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}>
                <MapView
                  style={{
                    flex: 1,
                  }}
                  ref={(map) => {
                    this.map = map;
                  }}
                  showsUserLocation
                  initialRegion={{
                    latitude: store.deliveryCoordinates.latitude,
                    longitude: store.deliveryCoordinates.longitude,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                  }}>
                  {store.deliveryCoordinates.latitude &&
                    store.deliveryCoordinates.longitude && (
                      <Marker
                        ref={(marker) => {
                          this.marker = marker;
                        }}
                        tracksViewChanges={false}
                        coordinate={{
                          latitude: store.deliveryCoordinates.latitude,
                          longitude: store.deliveryCoordinates.longitude,
                        }}>
                        <View>
                          <Icon color={colors.primary} name="map-pin" />
                        </View>
                      </Marker>
                    )}
                </MapView>
              </View>
            </View>
          )}
        </View>
      </Overlay>
    );
  }
}

export default StoreDetailsModal;
