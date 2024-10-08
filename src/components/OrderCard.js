import React, {PureComponent} from 'react';
import {Card, CardItem, Body, View} from 'native-base';
import {ActionSheetIOS} from 'react-native';
import moment from 'moment';
import {observer, inject} from 'mobx-react';
import {observable, action, computed} from 'mobx';
import FastImage from 'react-native-fast-image';
import {Button, Icon, Text, Badge} from 'react-native-elements';
import {colors} from '../../assets/colors';
import AddReviewModal from './AddReviewModal';
import Toast from './Toast';
import {PlaceholderMedia, Fade, Placeholder} from 'rn-placeholder';
import {CDN_BASE_URL} from '../util/variables';
import {openLink} from '../util/helpers';
import {cancelOrder} from '../util/firebase-functions';
import Pill from './Pill';

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

  handleOpenLink(url) {
    this.props.generalStore
      .toggleAppLoader()
      .then(() => openLink(url))
      .then(() => this.props.generalStore.toggleAppLoader());
  }

  handleViewOrderItems() {
    const {navigation, order} = this.props;

    navigation.navigate('Order Details', {orderId: order.orderId});
  }

  handleCancelOrder() {
    const {storeId, orderId, userOrderNumber} = this.props.order;

    cancelOrder(storeId, orderId, this.cancelReason).then((response) => {
      if (response.data.s !== 500 && response.data.s !== 400) {
        return Toast({
          text: `Order # ${userOrderNumber} successfully cancelled!`,
          type: 'success',
          duration: 3500,
        });
      }

      return Toast({
        text: response.data.m,
        type: 'danger',
        duration: 3500,
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

    navigation.navigate('Order Chat', {
      orderId: order.orderId,
    });
  }

  openAddReviewModal() {
    this.setState({addReviewModal: true});
  }

  CardHeader = ({
    imageReady,
    paymentMethod,
    userOrderNumber,
    userUnreadCount,
    orderStatus,
    storeName,
    storeId,
  }) => {
    const orderStatusText =
      orderStatus[0] === 'PAID' ? 'PROCESSING' : orderStatus;
    const displayImageUrl = {
      uri: `${CDN_BASE_URL}/images/stores/${storeId}/display.jpg`,
    };

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
            <FastImage
              source={displayImageUrl}
              style={{
                height: 35,
                width: 35,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.primary,
                marginRight: 10,
                backgroundColor: colors.primary,
                opacity: imageReady ? 1 : 0,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() => this.setState({ready: true})}
            />

            {!imageReady && (
              <View style={{position: 'absolute'}}>
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
              </View>
            )}

            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  numberOfLines={2}
                  style={{color: colors.text_primary, fontSize: 18}}>
                  {storeName}
                </Text>

                <Pill
                  title={paymentMethod}
                  titleStyle={{textAlignVertical: 'center', fontSize: 14}}
                  containerStyle={{marginLeft: 4}}
                />
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
                this.handleOpenLink(paymentLink);
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
      deliveryDiscount,
      marketeerVoucherDetails,
      paymentMethod,
      createdAt,
      storeName,
      storeId,
    } = order;
    const {url, ready, addReviewModal} = this.state;
    const finalDeliveryPrice = deliveryPrice
      ? Math.max(
          0,
          deliveryPrice -
            Number(deliveryDiscount ? deliveryDiscount : 0) -
            Number(
              marketeerVoucherDetails?.delivery?.discount?.amount !== undefined
                ? marketeerVoucherDetails.delivery.discount.amount
                : 0,
            ),
        )
      : 0;
    const totalAmount = subTotal + finalDeliveryPrice;

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
                storeId={storeId}
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
                    {`₱${totalAmount.toFixed(2)}`}
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
