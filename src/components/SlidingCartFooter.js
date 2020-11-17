import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {observer, inject} from 'mobx-react';

@inject('shopStore')
@observer
class SlidingCartFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {bottomPadding, handleCheckout} = this.props;

    return (
      <View
        style={{
          width: '100%',
          paddingHorizontal: 15,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}>
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
          buttonStyle={{
            height: 50,
            backgroundColor: colors.accent,
            borderRadius: 24,
          }}
          containerStyle={{
            padding: 0,
            marginBottom: bottomPadding + 10,
            width: '100%',
          }}
        />
      </View>
    );
  }
}

export default SlidingCartFooter;
