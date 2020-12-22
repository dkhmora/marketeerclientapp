import React, {Component} from 'react';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import {Container} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {GiftedChat, Bubble, Send} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import {Avatar, Icon, Button, Text} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import {observable, computed} from 'mobx';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import crashlytics from '@react-native-firebase/crashlytics';
import {nowMillis} from '../util/variables';
@inject('generalStore')
@inject('authStore')
@observer
class OrderChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };

    this.renderComposer.bind(this);
  }

  @observable imagePath = '';

  @computed get orderStatus() {
    const {selectedOrder} = this.props.generalStore;

    if (selectedOrder) {
      const statusLabel = Object.entries(selectedOrder.orderStatus).map(
        ([key, value]) => {
          if (value.status) {
            return key.toUpperCase();
          }

          return;
        },
      );

      return statusLabel.filter((item) => item != null);
    }

    return 'Unknown';
  }

  @computed get chatDisabled() {
    const {selectedOrder} = this.props.generalStore;
    const {orderStatus} = this;

    if (selectedOrder) {
      if (
        orderStatus[0] === 'CANCELLED' ||
        (orderStatus[0] === 'COMPLETED' &&
          nowMillis >=
            moment(selectedOrder.orderStatus.completed.updatedAt, 'x')
              .add(7, 'days')
              .format('x'))
      ) {
        return true;
      }
    }

    return false;
  }

  componentDidMount() {
    const {orderId} = this.props.route.params;

    this.props.generalStore.getOrder({orderId, readMessages: true});

    crashlytics().log('OrderChatScreen');
  }

  componentWillUnmount() {
    const {orderId} = this.props.route.params;
    const routes = this.props.navigation.dangerouslyGetState().routes;
    const index = this.props.navigation.dangerouslyGetState().index;

    this.props.generalStore.unsubscribeGetOrder &&
      this.props.generalStore.unsubscribeGetOrder();

    if (routes[index].name === 'Order Details') {
      this.props.generalStore.getOrder({orderId, readMessages: false});
    } else if (routes[index].name === 'Orders') {
      this.props.generalStore.setOrders(this.props.authStore.userId);
    } else {
      this.props.generalStore.selectedOrder = null;
    }
  }

  onSend(messages = []) {
    const {orderId} = this.props.route.params;

    this.props.generalStore.sendMessage(orderId, messages[0]);
  }

  handleTakePhoto() {
    ImagePicker.openCamera({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  handleSelectImage() {
    ImagePicker.openPicker({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      forceJpg: true,
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
          },
        }}
      />
    );
  }

  renderComposer() {
    const {orderStatus} = this;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <Text style={{textAlign: 'center', textAlignVertical: 'center'}}>
          {'Chat is disabled since order is '}
          {orderStatus[0] === 'CANCELLED'
            ? orderStatus[0]
            : 'COMPLETED and has surpassed 7 days'}
        </Text>
      </View>
    );
  }

  renderSend(props) {
    return (
      <Send {...props} containerStyle={{paddingHorizontal: 10}}>
        <Icon name="send" color={colors.primary} style={{marginBottom: 8}} />
      </Send>
    );
  }

  renderActions() {
    return (
      <View style={{flexDirection: 'row'}}>
        <Button
          type="clear"
          onPress={() => this.handleSelectImage()}
          color={colors.primary}
          containerStyle={{borderRadius: 24}}
          icon={<Icon name="image" color={colors.primary} />}
        />
        <Button
          type="clear"
          onPress={() => this.handleTakePhoto()}
          color={colors.primary}
          containerStyle={{borderRadius: 24}}
          icon={<Icon name="camera" color={colors.primary} />}
        />
      </View>
    );
  }

  renderAvatar(props) {
    const userInitial = props.currentMessage.user.name.charAt(0);

    return (
      <Avatar
        size="small"
        rounded
        overlayContainerStyle={{backgroundColor: colors.primary}}
        titleStyle={{color: colors.icons}}
        title={userInitial}
        activeOpacity={0.7}
      />
    );
  }

  render() {
    const {orderMessages, selectedOrder} = this.props.generalStore;
    const {navigation} = this.props;
    const {chatDisabled} = this;
    const user = {
      _id: this.props.authStore.userId,
      name: this.props.authStore.userName,
    };

    if (selectedOrder && orderMessages) {
      const headerTitle = `${selectedOrder.storeName} | Order # ${selectedOrder.userOrderNumber}`;
      const dataSource = orderMessages.slice();

      return (
        <Container style={{flex: 1}}>
          <BaseHeader title={headerTitle} backButton navigation={navigation} />

          <ConfirmationModal
            isVisible={this.imagePath !== ''}
            title="Send Image?"
            image={this.imagePath}
            onConfirm={() => {
              this.props.generalStore.sendImage(
                selectedOrder.orderId,
                selectedOrder.userId,
                selectedOrder.storeId,
                user,
                this.imagePath,
              );
              this.imagePath = '';
            }}
            closeModal={() => (this.imagePath = '')}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <GiftedChat
              textStyle={{color: colors.primary}}
              renderAvatar={this.renderAvatar}
              renderBubble={this.renderBubble}
              renderActions={
                !chatDisabled ? this.renderActions.bind(this) : null
              }
              renderSend={!chatDisabled ? this.renderSend : null}
              renderComposer={
                chatDisabled ? this.renderComposer.bind(this) : null
              }
              textInputStyle={{
                fontFamily: 'ProductSans-Light',
                borderBottomWidth: 1,
                borderBottomColor: colors.primary,
              }}
              isKeyboardInternallyHandled={false}
              listViewProps={{marginBottom: 20}}
              alwaysShowSend={!chatDisabled}
              showAvatarForEveryMessage
              messages={dataSource}
              onSend={(messages) => this.onSend(messages)}
              user={user}
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAvoidingView>
        </Container>
      );
    }

    return null;
  }
}

export default OrderChatScreen;
