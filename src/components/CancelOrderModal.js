import React, {Component} from 'react';
import {Overlay, Text, Button, Icon, Input} from 'react-native-elements';
import {View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {inject, observer} from 'mobx-react';
import Toast from './Toast';
import {colors} from '../../assets/colors';
import {Keyboard} from 'react-native';

@inject('generalStore')
@observer
class CancelOrderModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cancelReasonCheck: false,
      cancelReason: '',
      loading: false,
    };
  }

  handleCancelReasonChange = (cancelReason) => {
    this.setState({cancelReason});

    if (cancelReason !== '') {
      this.setState({
        cancelReasonCheck: true,
      });
    } else {
      this.setState({
        cancelReasonCheck: false,
      });
    }
  };

  handleConfirm() {
    this.setState({loading: true});

    this.props.generalStore
      .cancelOrder(
        this.props.generalStore.selectedCancelOrder.orderId,
        this.state.cancelReason,
      )
      .then((response) => {
        this.setState({
          loading: false,
          cancelReason: '',
          cancelReasonCheck: false,
        });

        this.closeModal();

        if (response.data.s !== 500 && response.data.s !== 400) {
          Toast({
            text: `Order # ${
              this.props.generalStore.selectedCancelOrder
                ? this.props.generalStore.selectedCancelOrder.merchantOrderNumber
                : ''
            } successfully cancelled!`,
            type: 'success',
            duration: 3500,
          });
        } else {
          if (this.props.generalStore.selectedOrder) {
            this.props.navigation.goBack();
          }
          Toast({
            text: response.data.m,
            type: 'danger',
            duration: 3500,
          });
        }

        this.props.generalStore.selectedCancelOrder = null;
      });
  }

  closeModal() {
    if (!this.state.loading) {
      this.props.generalStore.cancelOrderModal = false;
      this.props.generalStore.selectedCancelOrder = null;
    }
  }

  render() {
    const { isVisible } = this.props;
    const {cancelReasonCheck} = this.state;

    return (
      <Overlay
        isVisible={this.props.generalStore.cancelOrderModal}
        onBackdropPress={() => Keyboard.dismiss()}
        statusBarTranslucent
        animationType="fade"
        width="80%"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 15, width: '80%'}}>
        <View>
          <Text
            onPress={() => Keyboard.dismiss()}
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            Are you sure you want to cancel Order #{' '}
            {this.props.generalStore.selectedCancelOrder &&
              this.props.generalStore.selectedCancelOrder.merchantOrderNumber}
            ?
          </Text>

          <Input
            numberOfLines={8}
            multiline
            maxLength={600}
            disabled={this.state.loading}
            placeholder="Reason for Cancellation"
            placeholderTextColor={colors.text_secondary}
            value={this.state.cancelReason}
            onChangeText={(value) => this.handleCancelReasonChange(value)}
            style={{
              borderRadius: 24,
            }}
            inputStyle={{textAlignVertical: 'top'}}
          />

          {cancelReasonCheck ? (
            <Animatable.View
              useNativeDriver
              animation="bounceIn"
              style={{position: 'absolute', right: 10, bottom: '50%'}}>
              <Icon name="check-circle" color="#388e3c" size={20} />
            </Animatable.View>
          ) : null}

          <Text
            style={{
              alignSelf: 'flex-end',
              justifyContent: 'flex-start',
            }}>
            Character Limit: {this.state.cancelReason.length}/600
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 40,
            }}>
            {!this.state.loading && (
              <Button
                title="Cancel"
                type="clear"
                containerStyle={{
                  alignSelf: 'flex-end',
                  borderRadius: 30,
                }}
                onPress={() => this.closeModal()}
              />
            )}

            <Button
              title="Confirm"
              type="clear"
              disabled={!cancelReasonCheck}
              loading={this.state.loading}
              loadingProps={{size: 'small', color: colors.primary}}
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
              }}
              onPress={() => this.handleConfirm()}
            />
          </View>
        </View>
      </Overlay>
    );
  }
}

export default CancelOrderModal;
