import React, {Component} from 'react';
import {Text, Avatar, ButtonGroup, Icon, Button} from 'react-native-elements';
import {View, ActivityIndicator, ImageBackground} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import {inject} from 'mobx-react';
import {Rating} from 'react-native-rating-element';
import MapView, {Marker} from 'react-native-maps';
import moment from 'moment';
import {styles} from '../../assets/styles';
import {ScrollView} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';
import Divider from './Divider';

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
          paddingVertical: 5,
          paddingHorizontal: 10,
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

        <View style={{paddingHorizontal: 8, paddingVertical: 8}}>
          <Text style={{fontSize: 15, paddingBottom: 10, textAlign: 'justify'}}>
            {item.reviewBody}
          </Text>

          <Text style={{color: colors.text_secondary}}>{timeStamp}</Text>
        </View>

        <Divider />
      </View>
    );
  }

  StoreDetailsHeader({
    store,
    selectedIndex,
    coverImageUrl,
    displayImageUrl,
    onDownButtonPress,
    onChangeButtonIndex,
  }) {
    return (
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
                onPress={onChangeButtonIndex}
                selectedIndex={selectedIndex}
                buttons={['Store Info', 'Reviews']}
                buttonStyle={{
                  borderRadius: 40,
                  paddingRight: 0,
                  padding: 0,
                }}
                buttonContainerStyle={{
                  borderRadius: 40,
                  overflow: 'hidden',
                }}
                innerBorderStyle={{color: 'transparent', width: 10}}
                activeOpacity={0.7}
                textStyle={{color: colors.primary}}
                containerStyle={{
                  height: 30,
                  width: '80%',
                  borderRadius: 40,
                  paddingLeft: -5,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  backgroundColor: colors.icons,
                  borderWidth: 0,
                }}
                selectedButtonStyle={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  borderWidth: 1,
                  elevation: 2,
                  overflow: 'hidden',
                }}
                selectedTextStyle={{
                  color: colors.icons,
                }}
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  renderItem = ({item, index}) => (
    <this.ReviewListItem item={item} key={item.orderId} />
  );

  render() {
    const {store} = this.props;
    const {reviewsLoading, reviews, selectedIndex} = this.state;
    const {displayImageUrl, coverImageUrl} = this.props;
    const {StoreDetailsHeader} = this;

    return (
      <Modalize
        ref={(modalizeRef) => (this.modalizeRef = modalizeRef)}
        HeaderComponent={
          <StoreDetailsHeader
            store={store}
            selectedIndex={selectedIndex}
            coverImageUrl={coverImageUrl}
            displayImageUrl={displayImageUrl}
            onDownButtonPress={() => this.modalizeRef.close('default')}
            onChangeButtonIndex={(index) =>
              this.setState({selectedIndex: index})
            }
          />
        }
        tapGestureEnabled
        flatListProps={
          selectedIndex !== 0 && {
            ListEmptyComponent: reviewsLoading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
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
            ),
            data: reviews ? reviews : [],
            renderItem: this.renderItem,
            initialNumToRender: 30,
            showsVerticalScrollIndicator: false,
            keyExtractor: (item) => item.orderId,
            contentContainerStyle: {flexGrow: 1},
            style: {paddingHorizontal: 10},
          }
        }
        handleStyle={{
          backgroundColor: colors.text_secondary,
          opacity: 0.85,
        }}
        panGestureComponentEnabled>
        {selectedIndex === 0 && (
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
                height: 400,
                width: '100%',
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
      </Modalize>
    );
  }
}

export default StoreDetailsModal;
