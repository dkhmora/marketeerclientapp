import React, {PureComponent} from 'react';
import {Overlay, Text, Button, Input} from 'react-native-elements';
import {View} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {inject} from 'mobx-react';
import {Rating} from 'react-native-rating-element';
import { addReview } from '../util/firebase-functions';

@inject('generalStore')
class AddReviewModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      reviewBody: '',
      rating: 5,
    };
  }

  handleBackdropPress() {
    const {closeModal} = this.props;

    closeModal();
  }

  submitReview() {
    const {order, closeModal, onReviewSubmit} = this.props;
    const {orderId, storeId} = order;
    const {rating, reviewBody} = this.state;

    const review = {
      orderId,
      storeId,
      rating,
      reviewBody,
    };

    this.props.generalStore.appReady = false;

    closeModal();

    addReview({review}).then(() => {
      this.props.generalStore.appReady = true;

      onReviewSubmit();
    });
  }

  render() {
    const {isVisible, closeModal, order, ...otherProps} = this.props;
    const {rating} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={() => this.handleBackdropPress()}
        statusBarTranslucent
        animationType="fade"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View style={{width: '80%'}}>
          <View style={{padding: 15}}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'ProductSans-Regular',
                paddingBottom: 20,
              }}>
              Review Order # {order.userOrderNumber}
            </Text>

            <Text
              style={{
                color: colors.text_primary,
                fontSize: 16,
                paddingBottom: 20,
              }}>
              How was your experience? Share it to help other people!
            </Text>

            <Rating
              type="custom"
              direction="row"
              rated={rating}
              onIconTap={(position) => this.setState({rating: position})}
              selectedIconImage={require('../../assets/images/feather_filled.png')}
              emptyIconImage={require('../../assets/images/feather_unfilled.png')}
              size={40}
              tintColor={colors.primary}
              ratingColor={colors.accent}
              ratingBackgroundColor="#455A64"
            />

            <View style={[styles.action, {marginTop: 10}]}>
              <Input
                placeholder={`Tell others what you thought about ${order.storeName}!`}
                multiline
                numberOfLines={10}
                maxLength={250}
                style={styles.textInput}
                inputStyle={{textAlignVertical: 'top'}}
                autoCapitalize="none"
                onChangeText={(value) => this.setState({reviewBody: value})}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                marginTop: 40,
              }}>
              <Button
                title="Cancel"
                type="clear"
                containerStyle={{alignSelf: 'flex-end', borderRadius: 30}}
                onPress={() => closeModal()}
              />

              <Button
                title="Confirm"
                type="clear"
                containerStyle={{
                  alignSelf: 'flex-end',
                  borderRadius: 30,
                }}
                onPress={() => this.submitReview()}
              />
            </View>
          </View>
        </View>
      </Overlay>
    );
  }
}

export default AddReviewModal;
