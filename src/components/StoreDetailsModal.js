import React, {Component} from 'react';
import {Text, Avatar, ButtonGroup, Icon, Button} from 'react-native-elements';
import {View, ActivityIndicator, FlatList, ImageBackground} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import {inject} from 'mobx-react';
import {Rating} from 'react-native-rating-element';
import MapView, {Marker} from 'react-native-maps';
import moment from 'moment';
import {styles} from '../../assets/styles';
import {ScrollView} from 'react-native-gesture-handler';

@inject('generalStore')
class StoreDetailsModal extends Component {
  constructor(props) {
    super(props);

    const {displayImageUrl, coverImageUrl} = this.props;

    this.state = {
      reviewsLoading: true,
      reviews: [],
      selectedIndex: 0,
      displayImageUrl,
      coverImageUrl,
    };
  }

  componentDidMount() {
    const {displayImageUrl, coverImageUrl} = this.props;
    this.getReviews();

    if (!displayImageUrl || !coverImageUrl) {
      this.getImage();
    }
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

  getImage = async () => {
    const {displayImage, coverImage} = this.props.route.params.store;

    const displayImageRef = storage().ref(displayImage);
    const coverImageRef = storage().ref(coverImage);
    const coverImageUrl = await coverImageRef.getDownloadURL().catch((err) => {
      return null;
    });

    const displayImageUrl = await displayImageRef
      .getDownloadURL()
      .catch((err) => {
        return null;
      });

    this.setState({displayImageUrl, coverImageUrl});
  };

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
    const {store, onDownButtonPress} = this.props;
    const {
      reviewsLoading,
      reviews,
      displayImageUrl,
      coverImageUrl,
      selectedIndex,
    } = this.state;

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
          <ImageBackground
            source={
              coverImageUrl
                ? {uri: coverImageUrl}
                : require('../../assets/images/black.jpg')
            }
            style={{
              alignSelf: 'flex-start',
              maxWidth: '100%',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              width: '100%',
              flexDirection: 'row',
              aspectRatio: 1.5,
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
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <View
              style={{
                flexDirection: 'column',
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                paddingHorizontal: 10,
                paddingTop: 20,
                paddingBottom: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Button
                onPress={() => onDownButtonPress()}
                type="clear"
                color={colors.icons}
                icon={<Icon name="arrow-down" color={colors.primary} />}
                buttonStyle={{borderRadius: 30}}
                containerStyle={[
                  styles.buttonContainer,
                  {
                    backgroundColor: colors.icons,
                    height: 40,
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  },
                ]}
              />

              <FastImage
                source={
                  displayImageUrl
                    ? {uri: displayImageUrl}
                    : require('../../assets/images/black.jpg')
                }
                style={{
                  borderRadius: 10,
                  borderWidth: 0.7,
                  borderColor: 'rgba(255,255,255,0.4)',
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
                }}
                resizeMode={FastImage.resizeMode.contain}
              />

              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                style={{
                  color: colors.icons,
                  fontSize: 24,
                }}>
                {store.storeName}
              </Text>

              {store.ratingAverage && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: colors.icons,
                      fontSize: 17,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    {store.ratingAverage.toFixed(1)}({store.reviewNumber})
                  </Text>

                  <FastImage
                    source={require('../../assets/images/feather_filled.png')}
                    style={{
                      width: 16,
                      height: 16,
                      marginLeft: 2,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </View>
              )}

              <View style={{flex: 1, justifyContent: 'flex-end'}}>
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
              {store.storeDescription && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    maxWidth: '90%',
                  }}>
                  <Icon
                    name="align-justify"
                    color={colors.primary}
                    style={{paddingRight: 10}}
                  />
                  <ScrollView style={{maxHeight: 16 * 6}}>
                    <Text style={{fontSize: 16}}>{store.storeDescription}</Text>
                  </ScrollView>
                </View>
              )}

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
