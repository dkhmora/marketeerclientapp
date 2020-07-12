import React, {Component} from 'react';
import {Overlay, Text, Avatar} from 'react-native-elements';
import {View, ActivityIndicator, FlatList, ImageBackground} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import {inject} from 'mobx-react';
import {CardItem, Card} from 'native-base';
import {Rating} from 'react-native-rating-element';

@inject('generalStore')
class StoreDetailsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reviewsLoading: true,
      reviews: [],
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
          console.log(this.state.reviews);
          this.setState({reviewsLoading: false});
        },
      );
    }
  }

  ReviewListItem({item}) {
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
              title="D"
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
            {item.reviewBody}sadasdsadas asd as das dsadasdsadasdsa das das dasd
            asdasd asd sa asd as dsa dasdsa a d adasdasdasd
          </Text>

          <Text style={{color: colors.text_secondary}}>10 Years ago</Text>
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
    const {reviewsLoading, reviews} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onShow={() => this.getReviews()}
        onBackdropPress={() => this.handleBackdropPress()}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View style={{flex: 1, maxWidth: '90%', maxHeight: '90%'}}>
          <View>
            {coverImageUrl && (
              <ImageBackground
                source={{uri: coverImageUrl}}
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  height: 130,
                  aspectRatio: 3,
                  elevation: 10,
                  resizeMode: 'stretch',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    paddingHorizontal: 10,
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
                        marginRight: 10,
                      }}
                      resizeMode={FastImage.resizeMode.center}
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
              </ImageBackground>
            )}
          </View>

          {reviewsLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={{flex: 1, padding: 10}}>
              <Card
                style={{
                  flex: 1,
                  borderRadius: 10,
                  overflow: 'hidden',
                  maxHeight: '80%',
                }}>
                <CardItem
                  header
                  bordered
                  style={{
                    backgroundColor: colors.primary,
                  }}>
                  <Text style={{color: colors.icons, fontSize: 20}}>
                    Customer Reviews
                  </Text>
                </CardItem>

                <CardItem
                  style={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    flex: 1,
                  }}>
                  <FlatList
                    style={{flex: 1, alignSelf: 'flex-start'}}
                    data={reviews}
                    initialNumToRender={30}
                    renderItem={({item, index}) => (
                      <this.ReviewListItem item={item} key={index} />
                    )}
                    keyExtractor={(item) => item.orderId}
                    showsVerticalScrollIndicator={false}
                  />
                </CardItem>
              </Card>
            </View>
          )}
        </View>
      </Overlay>
    );
  }
}

export default StoreDetailsModal;
