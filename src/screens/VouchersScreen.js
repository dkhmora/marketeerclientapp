import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {View} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import VoucherList from '../components/vouchers/VoucherList';

@inject('generalStore')
@observer
class VouchersScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.generalStore.setAppData();
  }

  render() {
    const {
      props: {
        navigation,
        route: {params},
        generalStore: {appwideVouchers},
      },
    } = this;

    const vouchers = Object.entries(appwideVouchers).map(
      ([voucherId, voucherData]) => {
        return {voucherId, ...voucherData};
      },
    );

    return (
      <View style={{flex: 1}}>
        <BaseHeader title="Vouchers" backButton navigation={navigation} />

        <VoucherList vouchers={vouchers} />
      </View>
    );
  }
}

export default VouchersScreen;
