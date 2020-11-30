import {Card} from 'native-base';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-elements';
import {colors} from '../../../assets/colors';

export default class VoucherCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      props: {voucher},
    } = this;
    return (
      <Card
        style={{
          flex: 1,
          padding: 0,
          margin: 0,
          borderRadius: 8,
          elevation: 2,
          overflow: 'hidden',
        }}>
        <View
          style={{
            flex: 1,
            borderRadius: 8,
            overflow: 'hidden',
            paddingHorizontal: 10,
            paddingVertical: 5,
            alignItems: 'flex-start',
          }}>
          <Text style={{fontFamily: 'ProductSans-Bold', fontSize: 18}}>
            {voucher.title}
          </Text>
          <Text>{voucher.description}</Text>
          <Text>Use for up to {voucher.maxUses} uses</Text>

          <Button
            title="Use Voucher"
            type="clear"
            containerStyle={{
              alignSelf: 'flex-end',
              borderRadius: 30,
              overflow: 'hidden',
            }}
          />
        </View>
      </Card>
    );
  }
}
