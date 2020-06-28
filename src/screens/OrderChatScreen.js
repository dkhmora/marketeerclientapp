import React, {Component} from 'react';
import {View, Image} from 'react-native';
import {Container, Text, Input, Item} from 'native-base';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseHeader from '../components/BaseHeader';
import {Button, Icon} from 'react-native-elements';
import {
  GiftedChat,
  Bubble,
  Send,
  Composer,
  MessageImage,
} from 'react-native-gifted-chat';
import {inject, observer} from 'mobx-react';
import ImagePicker from 'react-native-image-crop-picker';
import {observable} from 'mobx';
import {colors} from '../../assets/colors';

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
    const {orderId} = this.props.route.params;
    this.props.generalStore.getMessages(orderId);
  }

  componentWillUnmount() {
    this.props.generalStore.unsubscribeGetMessages();
  }

  onSend(messages = []) {
    const {orderId} = this.props.route.params;
    this.props.generalStore.sendMessage(orderId, messages[0]);
  }

  handleTakePhoto() {
    const {orderId} = this.props.route.params;

    ImagePicker.openCamera({
      width: 1280,
      height: 720,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .then(() =>
        this.props.generalStore.sendImage(
          orderId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => console.log(err));
  }

  handleSelectImage() {
    const {orderId} = this.props.route.params;

    ImagePicker.openPicker({
      width: 1280,
      height: 720,
    })
      .then((image) => {
        this.imagePath = image.path;
      })
      .then(() =>
        this.props.generalStore.sendImage(
          orderId,
          this.state.user,
          this.imagePath,
        ),
      )
      .catch((err) => console.log(err));
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
    return (
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
          <Icon name="send" color={colors.primary} style={{marginBottom: 8}} />
        </Send>
      </View>
    );
  }

  render() {
    const {navigation} = this.props;
    const {
      storeName,
      userAddress,
      orderNumber,
      orderId,
    } = this.props.route.params;

    const headerTitle = `${storeName} | Order # ${orderNumber}`;

    const {orderMessages} = this.props.generalStore;

    const dataSource = orderMessages.slice();

    return (
      <Container style={{flex: 1}}>
        <BaseHeader title={headerTitle} backButton navigation={navigation} />

        <View style={{flex: 1}}>
          <GiftedChat
            textStyle={{color: colors.primary}}
            renderBubble={this.renderBubble}
            renderComposer={this.renderComposer.bind(this)}
            maxComposerHeight={150}
            listViewProps={{marginBottom: 20}}
            alwaysShowSend
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
