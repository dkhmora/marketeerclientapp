import React, {PureComponent} from 'react';
import {Card, CardItem, Body, View} from 'native-base';
import {ActionSheetIOS, Linking} from 'react-native';
import moment from 'moment';
import {observer, inject} from 'mobx-react';
import {observable, action, computed} from 'mobx';
import FastImage from 'react-native-fast-image';
import {Button, Icon, Text, Badge} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import {colors} from '../../assets/colors';
import AddReviewModal from './AddReviewModal';
import Toast from './Toast';
import {PlaceholderMedia, Fade, Placeholder} from 'rn-placeholder';
import InAppBrowser from 'react-native-inappbrowser-reborn';

@inject('generalStore')
@inject('shopStore')
@observer
class OrderCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/images/placeholder.jpg'),
      ready: false,
      addReviewModal: false,
    };
  }

  @observable confirmationModal = false;
  @observable cancelReason = '';

  @computed get timeStamp() {
    const {order} = this.props;

    return moment(order.updatedAt, 'x').fromNow();
  }

  @computed get orderStatus() {
    const {orderStatus} = this.props.order;

    const statusLabel =
      orderStatus &&
      Object.entries(orderStatus).map(([key, value]) => {
        if (value.status) {
          return key.toUpperCase();
        }

        return null;
      });

    return statusLabel ? statusLabel.filter((item) => item != null) : 'null';
  }

  @action openConfirmationModal() {
    this.confirmationModal = true;
  }

  @action closeConfirmationModal() {
    this.confirmationModal = false;
  }

  async openLink(url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          dismissButtonStyle: 'close',
          preferredBarTintColor: colors.primary,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'pageSheet',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: colors.primary,
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });
      } else {
        Linking.openURL(url);
      }
      this.props.generalStore.appReady = true;
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  componentDidMount() {
    this.getDisplayImageUrl();
  }

  async getDisplayImageUrl() {
    const {storeId} = this.props.order;

    const ref = storage().ref(`/images/stores/${storeId}/display.jpg`);
    const link = await ref.getDownloadURL().catch((err) => {
      Toast({text: err.message, type: 'danger'});

      return null;
    });

    this.setState({url: {uri: link}, ready: true});
  }

  handleViewOrderItems() {
    const {navigation, order} = this.props;
    const {orderStatus} = this;

    navigation.navigate('Order Details', {order, orderStatus});
  }

  handleCancelOrder() {
    const {storeId, orderId, userOrderNumber} = this.props.order;

    this.props.generalStore
      .cancelOrder(storeId, orderId, this.cancelReason)
      .then(() => {
        Toast({
          text: `Order # ${userOrderNumber} successfully cancelled!`,
          buttonText: 'Okay',
          type: 'success',
          duration: 3500,
          style: {margin: 20, borderRadius: 16},
        });
      });
  }

  openOptions() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Decline Order'],
        destructiveIndex: 1,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else {
          this.handleCancelOrder.bind(this);
        }
      },
    );
  }

  openOrderChat() {
    const {navigation, order} = this.props;
    const {userAddress, userOrderNumber, storeName} = order;

    navigation.navigate('Order Chat', {
      storeName,
      userAddress,
      order,
      userOrderNumber,
      orderStatus: this.orderStatus,
    });
  }

  openAddReviewModal() {
    this.setState({addReviewModal: true});
  }

  CardHeader = ({
    imageUrl,
    imageReady,
    paymentMethod,
    userOrderNumber,
    userUnreadCount,
    orderStatus,
    storeName,
  }) => {
    const orderStatusText =
      orderStatus[0] === 'PAID' ? 'PROCESSING' : orderStatus;

    return (
      <CardItem
        button
        header
        bordered
        onPress={() => this.openOrderChat()}
        style={{paddingTop: 8, paddingBottom: 8}}>
        <Body
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {imageUrl && imageReady ? (
              <FastImage
                source={imageUrl}
                style={{
                  height: 35,
                  width: 35,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  marginRight: 10,
                  backgroundColor: colors.primary,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <Placeholder Animation={Fade}>
                <PlaceholderMedia
                  style={{
                    backgroundColor: colors.primary,
                    height: 35,
                    width: 35,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    marginRight: 10,
                  }}
                />
              </Placeholder>
            )}

            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  numberOfLines={2}
                  style={{color: colors.text_primary, fontSize: 18}}>
                  {storeName}
                </Text>

                <View
                  style={{
                    borderRadius: 20,
                    backgroundColor: colors.accent,
                    padding: 3,
                    paddingHorizontal: 10,
                    marginLeft: 2,
                    alignSelf: 'flex-start',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'ProductSans-Regular',
                      color: colors.icons,
                    }}>
                    {paymentMethod}
                  </Text>
                </View>
              </View>

              <View style={{flexDirection: 'row'}}>
                <Text
                  note
                  style={{color: colors.text_secondary, marginRight: 8}}>
                  Order # {userOrderNumber}
                </Text>

                <Text style={{color: colors.primary}}>{orderStatusText}</Text>
              </View>
            </View>
          </View>
          <View style={{alignItems: 'center'}}>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 5,
                paddingTop: 5,
              }}>
              <Icon name="message-square" color={colors.primary} />

              {userUnreadCount !== null && userUnreadCount > 0 && (
                <Badge
                  value={userUnreadCount}
                  badgeStyle={{backgroundColor: colors.accent}}
                  containerStyle={{position: 'absolute', top: 0, right: 0}}
                />
              )}
            </View>
            <Text style={{color: colors.primary}}>Chat</Text>
          </View>
        </Body>
      </CardItem>
    );
  };

  CardFooter = ({orderStatus}) => {
    const {order} = this.props;
    const {paymentLink, paymentMethod, reviewed} = order;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 15,
          paddingBottom: 5,
          minHeight: 35,
        }}>
        <Text>Updated {this.timeStamp}</Text>

        {orderStatus[0] === 'COMPLETED' && !reviewed && (
          <Button
            title="Review"
            type="clear"
            onPress={() => this.openAddReviewModal()}
            titleStyle={{color: colors.primary}}
            containerStyle={{borderRadius: 24}}
          />
        )}

        {orderStatus[0] === 'UNPAID' &&
          paymentMethod === 'Online Banking' &&
          paymentLink && (
            <Button
              title="Pay Now"
              type="clear"
              onPress={() => {
                this.props.generalStore.appReady = false;
                this.openLink(paymentLink);
              }}
              titleStyle={{color: colors.primary}}
              containerStyle={{borderRadius: 24}}
            />
          )}
      </View>
    );
  };

  render() {
    const {order, reviewed, refresh} = this.props;

    const {
      userOrderNumber,
      userUnreadCount,
      quantity,
      subTotal,
      deliveryPrice,
      paymentMethod,
      createdAt,
      storeName,
    } = order;
    const {url, ready, addReviewModal} = this.state;

    return (
      <View style={{flex: 1, paddingHorizontal: 5}}>
        <AddReviewModal
          order={order}
          isVisible={addReviewModal}
          closeModal={() => this.setState({addReviewModal: false})}
          onReviewSubmit={() => refresh()}
        />

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
          }}>
          <Card style={{flex: 1, borderRadius: 8, overflow: 'hidden'}}>
            <View>
              <this.CardHeader
                imageUrl={url}
                imageReady={ready}
                userOrderNumber={userOrderNumber}
                userUnreadCount={userUnreadCount}
                paymentMethod={paymentMethod}
                orderStatus={this.orderStatus}
                storeName={storeName}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                }}>
                <Button
                  title={`View Full Order (${quantity} items)`}
                  onPress={this.handleViewOrderItems.bind(this)}
                  titleStyle={{color: colors.icons}}
                  buttonStyle={{backgroundColor: colors.accent}}
                  containerStyle={{
                    borderRadius: 24,
                    marginRight: 10,
                    flex: 1,
                  }}
                />

                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.text_secondary,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      fontFamily: 'ProductSans-Bold',
                      textAlign: 'center',
                    }}>
                    ₱{subTotal + (deliveryPrice ? deliveryPrice : 0)}
                  </Text>

                  <Text>Total Amount</Text>
                </View>
              </View>

              <this.CardFooter
                createdAt={createdAt}
                paymentMethod={paymentMethod}
                orderStatus={this.orderStatus}
                reviewed={reviewed}
              />
            </View>
          </Card>
        </View>
      </View>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
