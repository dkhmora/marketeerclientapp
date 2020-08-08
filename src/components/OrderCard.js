import React, {PureComponent} from 'react';
import {Card, CardItem, Body, View} from 'native-base';
import {ActionSheetIOS} from 'react-native';
import moment from 'moment';
import {observer, inject} from 'mobx-react';
import {observable, action, computed} from 'mobx';
import FastImage from 'react-native-fast-image';
import {Button, Icon, Text} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import {colors} from '../../assets/colors';
import AddReviewModal from './AddReviewModal';
import Toast from './Toast';
import {PlaceholderMedia, Fade, Placeholder} from 'rn-placeholder';

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
      reviewedOnDevice: false,
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

    const statusLabel = Object.entries(orderStatus).map(([key, value]) => {
      if (value.status) {
        return key.toUpperCase();
      }

      return;
    });

    return statusLabel.filter((item) => item != null);
  }

  @action openConfirmationModal() {
    this.confirmationModal = true;
  }

  @action closeConfirmationModal() {
    this.confirmationModal = false;
  }

  componentDidMount() {
    this.getDisplayImageUrl();
  }

  async getDisplayImageUrl() {
    const {merchantId} = this.props.order;

    const ref = storage().ref(`/images/merchants/${merchantId}/display.jpg`);
    const link = await ref.getDownloadURL();

    this.setState({url: {uri: link}, ready: true});
  }

  handleViewOrderItems() {
    const {navigation, order} = this.props;
    const {orderStatus} = this;

    navigation.navigate('Order Details', {order, orderStatus});
  }

  handleCancelOrder() {
    const {merchantId, orderId, userOrderNumber} = this.props.order;

    this.props.generalStore
      .cancelOrder(merchantId, orderId, this.cancelReason)
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
    orderStatus,
    storeName,
  }) => {
    return (
      <CardItem button header bordered onPress={() => this.openOrderChat()}>
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
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <Placeholder Animation={Fade}>
                <PlaceholderMedia
                  style={{
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

                <Text style={{color: colors.primary}}>{orderStatus}</Text>
              </View>
            </View>
          </View>
          <View>
            <Icon name="message-square" color={colors.primary} />
            <Text style={{color: colors.primary}}>Chat</Text>
          </View>
        </Body>
      </CardItem>
    );
  };

  CardFooter = ({createdAt, paymentMethod, orderStatus}) => {
    const {order} = this.props;
    const {reviewedOnDevice} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 15,
          paddingBottom: 5,
          height: 40,
        }}>
        <Text>Updated {this.timeStamp}</Text>

        {orderStatus[0] === 'COMPLETED' &&
          !order.reviewed &&
          !reviewedOnDevice && (
            <Button
              title="Review"
              type="clear"
              onPress={() => this.openAddReviewModal()}
              titleStyle={{color: colors.primary}}
              containerStyle={{borderRadius: 24}}
            />
          )}
      </View>
    );
  };

  render() {
    const {order, reviewed} = this.props;

    const {
      userOrderNumber,
      quantity,
      subTotal,
      deliveryPrice,
      paymentMethod,
      createdAt,
      storeName,
    } = order;
    const {url, ready, addReviewModal} = this.state;

    return (
      <View>
        <AddReviewModal
          order={order}
          isVisible={addReviewModal}
          closeModal={() => this.setState({addReviewModal: false})}
          onReviewSubmit={() => this.setState({reviewedOnDevice: true})}
        />

        <Card style={{borderRadius: 8, overflow: 'hidden'}}>
          <View style={{height: 175}}>
            <this.CardHeader
              imageUrl={url}
              imageReady={ready}
              userOrderNumber={userOrderNumber}
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
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
