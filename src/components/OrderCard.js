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

@inject('generalStore')
@observer
class OrderCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/images/placeholder.jpg'),
    };
  }

  @observable confirmationModal = false;
  @observable cancelReason = '';

  @computed get orderStatus() {
    const {orderStatus} = this.props;

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

  getImage = async () => {
    const ref = storage().ref(this.props.storeDetails.displayImage);
    const link = await ref.getDownloadURL();
    this.setState({url: {uri: link}});
  };

  componentDidMount() {
    if (this.props.storeDetails.displayImage) {
      this.getImage();
    }
  }

  handleChangeOrderStatus() {
    const {merchantId, orderId, orderNumber} = this.props;
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
    const {
      navigation,
      coordinates,
      orderId,
      orderStatus,
      storeName,
      orderNumber,
      quantity,
      shippingPrice,
      totalAmount,
      userAddress,
      createdAt,
    } = this.props;

    const cancelReason =
      orderStatus.cancelled.status && orderStatus.cancelled.reason;

    this.props.generalStore.setOrderItems(orderId).then(() => {
      navigation.navigate('Order Details', {
        orderId,
        orderItems: this.props.generalStore.orderItems,
        coordinates,
        storeName,
        orderNumber,
        orderStatus,
        quantity,
        shippingPrice,
        totalAmount,
        userAddress,
        createdAt,
      });
    });
  }

  handleCancelOrder() {
    const {merchantId, orderId, orderNumber} = this.props;
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

  render() {
    const {
      orderNumber,
      storeDetails,
      quantity,
      orderStatus,
      totalAmount,
      paymentMethod,
      orderId,
      userAddress,
      createdAt,
      index,
      navigation,
      ...otherProps
    } = this.props;

    const {storeName} = storeDetails;

    console.log(paymentMethod);

    const {url} = this.state;

    const CardHeader = (image) => {
      return (
        <CardItem
          button
          header
          bordered
          onPress={() =>
            navigation.navigate('Order Chat', {
              storeName,
              userAddress,
              orderId,
              orderNumber,
              orderStatus,
            })
          }>
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
                source={url}
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
                    {storeName}
                  </Text>
                  <View
                    key={index}
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
                  <Text style={{color: colors.primary}}>
                    {this.orderStatus}
                  </Text>
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

    const CardFooter = () => {
      const timeStamp = moment(createdAt, ISO_8601).format(
        'MM-DD-YYYY hh:MM A',
      );

      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingBottom: 5,
          }}>
          <Text note>{timeStamp}</Text>
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

        <Card {...otherProps} style={{borderRadius: 8, overflow: 'hidden'}}>
          <CardHeader image={url} />
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
          <CardFooter />
        </Card>
      </View>
    );
  }
}

OrderCard.defaultProps = {
  editable: false,
};

export default OrderCard;
