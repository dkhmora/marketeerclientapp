import React, {Component} from 'react';
import {
  Card,
  CardItem,
  Left,
  Body,
  Right,
  Toast,
  View,
  Item,
  Input,
  H3,
  Textarea,
} from 'native-base';
import {ActionSheetIOS, Platform} from 'react-native';
import moment, {ISO_8601} from 'moment';
import {observer, inject} from 'mobx-react';
import Modal from 'react-native-modal';
import {observable, action, computed} from 'mobx';
import BaseOptionsMenu from './BaseOptionsMenu';
import FastImage from 'react-native-fast-image';
import {Button, Icon, Text} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import {colors} from '../../assets/colors';
import OrderCardLoader from './OrderCardLoader';

@inject('generalStore')
@inject('shopStore')
@observer
class OrderCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/images/placeholder.jpg'),
      storeDetails: null,
      ready: false,
    };

    this.props.shopStore
      .getStoreDetailsFromMerchantId(this.props.order.merchantId)
      .then((storeDetails) => {
        this.setState({storeDetails, ready: true});
        this.getDisplayImageUrl(storeDetails.displayImage);
      });
  }

  @observable confirmationModal = false;
  @observable cancelReason = '';

  @computed get orderStatus() {
    const {orderStatus} = this.props.order;

    return Object.entries(orderStatus).map(([key, value]) => {
      if (value.status) {
        return key.toUpperCase();
      }
    });
  }

  @action openConfirmationModal() {
    this.confirmationModal = true;
  }

  @action closeConfirmationModal() {
    this.confirmationModal = false;
  }

  getDisplayImageUrl = async (imageRef) => {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();

    this.setState({url: {uri: link}});
  };

  handleChangeOrderStatus() {
    const {merchantId, orderId, orderNumber} = this.props.order;

    this.props.generalStore.setOrderStatus(merchantId, orderId).then(() => {
      Toast.show({
        text: `Successfully changed Order # ${orderNumber} status!`,
        buttonText: 'Okay',
        type: 'success',
        duration: 3500,
        style: {margin: 20, borderRadius: 16},
      });
    });
    this.closeConfirmationModal();
  }

  handleViewOrderItems() {
    const {navigation, order} = this.props;

    navigation.navigate('Order Details', {order});
  }

  handleCancelOrder() {
    const {merchantId, orderId, orderNumber} = this.props.order;

    this.props.generalStore
      .cancelOrder(merchantId, orderId, this.cancelReason)
      .then(() => {
        Toast.show({
          text: `Order # ${orderNumber} successfully cancelled!`,
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
    const {userAddress, orderId, orderNumber, orderStatus} = order;
    const {storeName} = this.state.storeDetails;

    navigation.navigate('Order Chat', {
      storeName,
      userAddress,
      orderId,
      orderNumber,
      orderStatus,
    });
  }

  CardHeader = ({
    imageUrl,
    paymentMethod,
    orderNumber,
    orderStatus,
    storeDetails,
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
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  numberOfLines={2}
                  style={{color: colors.text_primary, fontSize: 18}}>
                  {storeDetails.storeName}
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
                  Order # {orderNumber}
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

  CardFooter = ({createdAt, paymentMethod}) => {
    const timeStamp = moment(createdAt, ISO_8601).format('MM-DD-YYYY hh:MM A');

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
        <Text>{timeStamp}</Text>
        {paymentMethod === 'Online Banking' && (
          <Button
            title="Pay Now"
            type="clear"
            onPress={this.handleViewOrderItems.bind(this)}
            titleStyle={{color: colors.primary}}
            containerStyle={{borderRadius: 24}}
          />
        )}
      </View>
    );
  };

  render() {
    const {navigation, order} = this.props;

    const {
      orderNumber,
      quantity,
      orderStatus,
      totalAmount,
      paymentMethod,
      orderId,
      userAddress,
      createdAt,
      index,
    } = order;
    const {url, ready} = this.state;

    return (
      <View>
        <View style={{flex: 1}}>
          <Modal
            isVisible={this.confirmationModal}
            transparent={true}
            style={{alignItems: 'center'}}>
            <Card
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                width: '100%',
              }}>
              <CardItem header>
                <Left>
                  <Body>
                    <H3>Are you sure?</H3>
                  </Body>
                </Left>
              </CardItem>

              <CardItem>
                <Body>
                  <Textarea
                    rowSpan={6}
                    maxLength={600}
                    bordered
                    placeholder="Reason for Cancellation"
                    value={this.cancelReason}
                    onChangeText={(value) => (this.cancelReason = value)}
                    style={{borderRadius: 24, width: '100%'}}
                  />

                  <Text note style={{alignSelf: 'flex-end', marginRight: 16}}>
                    Character Limit: {this.cancelReason.length}/600
                  </Text>
                </Body>
              </CardItem>

              <CardItem>
                <Body>
                  <Text note style={{textAlign: 'justify', width: '100%'}}>
                    You can no longer bring back an order after it has been
                    cancelled.
                  </Text>
                </Body>
              </CardItem>

              <CardItem footer>
                <Left />

                <Right style={{flexDirection: 'row', marginRight: 25}}>
                  <Button
                    transparent
                    onPress={this.closeConfirmationModal.bind(this)}>
                    <Text>Cancel</Text>
                  </Button>

                  <Button
                    transparent
                    onPress={this.handleCancelOrder.bind(this)}>
                    <Text>Confirm</Text>
                  </Button>
                </Right>
              </CardItem>
            </Card>
          </Modal>
        </View>

        <Card style={{borderRadius: 8, overflow: 'hidden'}}>
          {ready ? (
            <View style={{height: 175}}>
              <this.CardHeader
                imageUrl={url}
                orderNumber={orderNumber}
                paymentMethod={paymentMethod}
                orderStatus={this.orderStatus}
                storeDetails={this.state.storeDetails}
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
                    ₱{totalAmount}
                  </Text>

                  <Text>Total Amount</Text>
                </View>
              </View>

              <this.CardFooter
                createdAt={createdAt}
                paymentMethod={paymentMethod}
              />
            </View>
          ) : (
            <View style={{padding: 10, height: 175}}>
              <OrderCardLoader />
            </View>
          )}
        </Card>
      </View>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
