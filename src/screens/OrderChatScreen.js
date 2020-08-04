import React, {Component} from 'react';
import {View, Image} from 'react-native';
import {Container, Input, Item} from 'native-base';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseHeader from '../components/BaseHeader';
import {Button, Icon, Avatar, Text} from 'react-native-elements';
import {
  GiftedChat,
  Bubble,
  Send,
  Composer,
  MessageImage,
} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import ImagePicker from 'react-native-image-crop-picker';
import {observable, computed} from 'mobx';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';

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

  componentDidMount() {
    const {order} = this.props.route.params;
    this.props.generalStore.getMessages(order.orderId);
  }

  componentWillUnmount() {
    this.props.generalStore.unsubscribeGetMessages();
  }

  onSend(messages = []) {
    const {order} = this.props.route.params;
    this.props.generalStore.sendMessage(order.orderId, messages[0]);
  }

  handleTakePhoto() {
    const {order} = this.props.route.params;

    ImagePicker.openCamera({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .then(() =>
        this.props.generalStore.sendImage(
          order.orderId,
          order.userId,
          order.merchantId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => Toast({text: err, type: 'danger'}));
  }

  handleSelectImage() {
    const {order} = this.props.route.params;

    ImagePicker.openPicker({
      width: 1280,
      height: 720,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .then(() =>
        this.props.generalStore.sendImage(
          order.orderId,
          order.userId,
          order.merchantId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => Toast({text: err, type: 'danger'}));
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

  renderComposer(props) {
    const {orderStatus} = this.props.route.params;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {orderStatus[0] === 'CANCELLED' || orderStatus[0] === 'COMPLETED' ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Chat is disabled since order is {orderStatus[0]}</Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
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
            <View
              style={{
                flex: 1,
                marginLeft: 5,
                marginVertical: 10,
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: 24,
              }}>
              <Composer {...props} />
            </View>
            <Send {...props} containerStyle={{paddingHorizontal: 10}}>
              <Icon
                name="send"
                color={colors.primary}
                style={{marginBottom: 8}}
              />
            </Send>
          </View>
        )}
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
    const {storeName, userOrderNumber} = this.props.route.params;

    const headerTitle = `${storeName} | Order # ${userOrderNumber}`;

    const {orderMessages} = this.props.generalStore;

    const dataSource = orderMessages.slice();

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={headerTitle} backButton navigation={navigation} />

        <View style={{flex: 1}}>
          <GiftedChat
            textStyle={{color: colors.primary}}
            showAvatarForEveryMessage
            alwaysShowSend
            renderAvatar={this.renderAvatar}
            renderBubble={this.renderBubble}
            renderComposer={this.renderComposer.bind(this)}
            maxComposerHeight={150}
            listViewProps={{marginBottom: 20}}
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
