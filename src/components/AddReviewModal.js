import React, {PureComponent} from 'react';
import {Overlay, Text, Button, Input} from 'react-native-elements';
import {View, ActivityIndicator} from 'react-native';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {inject} from 'mobx-react';
import {Rating} from 'react-native-rating-element';
import Toast from './Toast';

@inject('generalStore')
class AddReviewModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      reviewTitle: '',
      reviewBody: '',
      rating: 5,
      loading: false,
    };
  }

  handleBackdropPress() {
    const {closeModal} = this.props;

    closeModal();
  }

  submitReview() {
    const {addReview} = this.props.generalStore;
    const {order, closeModal, onReviewSubmit} = this.props;
    const {orderId, merchantId} = order;
    const {rating, reviewBody, reviewTitle} = this.state;

    const review = {
      orderId,
      merchantId,
      rating,
      reviewBody,
      reviewTitle,
    };

    this.setState({loading: true});

    addReview({review}).then(() => {
      Toast({text: 'Successfully submitted review!'});

      this.setState({loading: false});

      onReviewSubmit();

      closeModal();
    });
  }

  render() {
    const {isVisible, closeModal, order, ...otherProps} = this.props;
    const {rating, loading} = this.state;

    return (
      <Overlay
        {...otherProps}
        isVisible={isVisible}
        onBackdropPress={() => this.handleBackdropPress()}
        windowBackgroundColor="rgba(255, 255, 255, .5)"
        overlayBackgroundColor="red"
        width="auto"
        height="auto"
        overlayStyle={{borderRadius: 10, padding: 0}}>
        <View style={{width: '80%'}}>
          {loading && (
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

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

            <View style={styles.action}>
              <Input
                placeholder="Review title"
                maxLength={50}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.setState({reviewTitle: value})}
              />
            </View>

            <View style={styles.action}>
              <Input
                placeholder="Write your review here..."
                multiline
                numberOfLines={5}
                maxLength={250}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.setState({reviewBody: value})}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}>
              <Button
                title="Cancel"
                type="clear"
                buttonStyle={{borderRadius: 24}}
                containerStyle={{alignSelf: 'flex-end', paddingTop: 20}}
                onPress={() => this.handleCancel()}
              />

              <Button
                title="Confirm"
                type="clear"
                buttonStyle={{borderRadius: 24, marginLeft: 15}}
                containerStyle={{alignSelf: 'flex-end', paddingTop: 20}}
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
