import React, {Component} from 'react';
import {View} from 'react-native';
import {Image, Text} from 'react-native-animatable';
import {Badge, Button, Icon} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {observer, inject} from 'mobx-react';

@inject('shopStore')
@observer
class SlidingCartHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {handleCheckout, onPress} = this.props;

    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}>
        <View
          onTouchStart={() => onPress && onPress()}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}>
          <Image
            source={require('../../assets/images/logo_cart.png')}
            style={{
              height: 35,
              width: 40,
              resizeMode: 'contain',
              tintColor: colors.primary,
              marginRight: 10,
            }}
          />

          <Badge
            value={this.props.shopStore.totalCartItemQuantity}
            badgeStyle={{backgroundColor: colors.accent}}
            containerStyle={{position: 'absolute', top: 4, right: 2}}
          />
        </View>

        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          onPress={() => onPress && onPress()}
          style={{
            flex: 1,
            fontSize: 26,
            fontFamily: 'ProductSans-Black',
            textAlignVertical: 'center',
          }}>
          ₱{this.props.shopStore.totalCartSubTotalAmount}
        </Text>

        <Button
          onPress={() => handleCheckout()}
          disabled={
            this.props.shopStore.totalCartItemQuantity <= 0 ||
            !this.props.shopStore.validCheckout
          }
          raised
          icon={<Icon name="arrow-right" color={colors.icons} />}
          iconRight
          title="Checkout"
          titleStyle={{
            color: colors.icons,
            fontFamily: 'ProductSans-Black',
            fontSize: 18,
            marginRight: '20%',
          }}
          buttonStyle={{backgroundColor: colors.accent, borderRadius: 24}}
          containerStyle={{
            padding: 0,
          }}
        />
      </View>
    );
  }
}

export default SlidingCartHeader;
