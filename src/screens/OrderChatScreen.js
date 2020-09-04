import React, {Component} from 'react';
import {View} from 'react-native';
import {Container} from 'native-base';
import BaseHeader from '../components/BaseHeader';
import {Button, Icon, Avatar, Text} from 'react-native-elements';
import {GiftedChat, Bubble, Send} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import ImagePicker from 'react-native-image-crop-picker';
import {observable, computed} from 'mobx';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';

@inject('generalStore')
@inject('authStore')
@observer
class OrderChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        _id: this.props.authStore.userId,
        name: this.props.authStore.userName,
      },
    };

    this.renderComposer.bind(this);
  }

  @observable imagePath = '';

  @computed get chatDisabled() {
    const {order, orderStatus} = this.props.route.params;

    if (
      orderStatus[0] === 'CANCELLED' ||
      firestore.Timestamp.now().toMillis() >=
        moment(order.orderStatus.completed.updatedAt, 'x')
          .add(7, 'days')
          .format('x')
    ) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    const {order} = this.props.route.params;
    this.props.generalStore.getMessages(order.orderId);
  }

  componentWillUnmount() {
    this.props.generalStore.unsubscribeGetMessages();

    this.props.generalStore.setOrders(this.props.route.params.order.userId);
  }

  onSend(messages = []) {
    const {order} = this.props.route.params;
    this.props.generalStore.sendMessage(order.orderId, messages[0]);
  }

  handleTakePhoto() {
    ImagePicker.openCamera({
      width: 1280,
      height: 720,
      mediaType: 'photo',
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
    const {orderStatus} = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <Text style={{textAlign: 'center', textAlignVertical: 'center'}}>
          Chat is disabled since order is{' '}
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
      <View
        style={{
          flexDirection: 'row',
        }}>
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
    const {navigation} = this.props;
    const {order, storeName, userOrderNumber} = this.props.route.params;
    const {chatDisabled} = this;

    const headerTitle = `${storeName} | Order # ${userOrderNumber}`;

    const {orderMessages} = this.props.generalStore;

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
              order.orderId,
              order.userId,
              order.storeId,
              this.state.user,
              this.imagePath,
            );
            this.imagePath = '';
          }}
          closeModal={() => (this.imagePath = '')}
        />

        <View style={{flex: 1}}>
          <GiftedChat
            textStyle={{color: colors.primary}}
            renderAvatar={this.renderAvatar}
            renderBubble={this.renderBubble}
            renderActions={!chatDisabled ? this.renderActions.bind(this) : null}
            renderSend={!chatDisabled ? this.renderSend : null}
            renderComposer={
              chatDisabled ? this.renderComposer.bind(this) : null
            }
            textInputStyle={{
              fontFamily: 'ProductSans-Light',
              borderBottomWidth: 1,
              borderBottomColor: colors.primary,
            }}
            listViewProps={{marginBottom: 20}}
            alwaysShowSend={!chatDisabled}
            showAvatarForEveryMessage
            messages={dataSource}
            onSend={(messages) => this.onSend(messages)}
            user={this.state.user}
          />
        </View>
      </Container>
    );
  }
}

export default OrderChatScreen;
