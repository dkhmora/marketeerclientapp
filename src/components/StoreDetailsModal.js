import React, {Component} from 'react';
import {
  Overlay,
  Text,
  Avatar,
  ButtonGroup,
  Icon,
  Button,
} from 'react-native-elements';
import {
  View,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import {inject} from 'mobx-react';
import {Rating} from 'react-native-rating-element';
import MapView, {Marker} from 'react-native-maps';
import moment from 'moment';

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

  componentDidMount() {
    this.getReviews();
  }

  async getReviews() {
    const {store} = this.props;
    const {reviews} = this.state;

    if (reviews.length <= 0) {
      this.setState(
        {
          reviews: await this.props.generalStore.getStoreReviews(store.storeId),
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

  renderItem = ({item, index}) => (
    <this.ReviewListItem item={item} key={item.orderId} />
  );

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props;
    const {reviewsLoading, reviews, selectedIndex} = this.state;

    return (
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: colors.icons,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
        }}>
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
                        borderWidth: 0.7,
                        borderColor: 'rgba(0,0,0,0.6)',
                        width: 90,
                        aspectRatio: 1,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 6,
                        marginRight: 10,
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  )}

                  <View style={{flex: 1}}>
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={{
                        color: colors.icons,
                        fontSize: 24,
                        marginBottom: 10,
                        paddingRight: 30,
                      }}>
                      {store.storeName}
                    </Text>

                    {store.storeDescription && (
                      <Text
                        numberOfLines={5}
                        adjustsFontSizeToFit
                        style={{
                          color: colors.icons,
                          fontSize: 16,
                          flexWrap: 'wrap',
                        }}>
                        {store.storeDescription}
                      </Text>
                    )}
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
                renderItem={this.renderItem}
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
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                paddingHorizontal: 15,
                paddingVertical: 10,
                justifyContent: 'flex-start',
              }}>
              {store.email && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    maxWidth: '90%',
                  }}>
                  <Icon
                    name="mail"
                    color={colors.primary}
                    style={{paddingRight: 10}}
                  />
                  <Text style={{fontSize: 16}}>{store.email}</Text>
                </View>
              )}

              {store.website && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    maxWidth: '90%',
                  }}>
                  <Icon
                    name="globe"
                    color={colors.primary}
                    style={{paddingRight: 10}}
                  />
                  <Text style={{fontSize: 16}}>{store.website}</Text>
                </View>
              )}

              {store.address && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingVertical: 10,
                    maxWidth: '90%',
                  }}>
                  <Icon
                    name="map-pin"
                    color={colors.primary}
                    style={{paddingRight: 10}}
                  />
                  <Text style={{fontSize: 16}}>{store.address}</Text>
                </View>
              )}
            </View>

            <View
              style={{
                flex: 1,
                overflow: 'hidden',
              }}>
              <MapView
                style={{
                  flex: 1,
                }}
                liteMode
                provider="google"
                ref={(map) => {
                  this.map = map;
                }}
                showsUserLocation
                initialRegion={{
                  latitude: store.storeLocation.latitude,
                  longitude: store.storeLocation.longitude,
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.009,
                }}>
                {store.storeLocation.latitude && store.storeLocation.longitude && (
                  <Marker
                    ref={(marker) => {
                      this.marker = marker;
                    }}
                    tracksViewChanges={false}
                    coordinate={{
                      latitude: store.storeLocation.latitude,
                      longitude: store.storeLocation.longitude,
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
    );
  }
}

export default StoreDetailsModal;
