import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {View} from 'react-native';
import BaseHeader from '../components/BaseHeader';
import VoucherList from '../components/vouchers/VoucherList';
import VouchersTab from '../navigation/VouchersTab';

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
        generalStore: {
          appwideVouchers,
          userDetails: {claimedVouchers},
        },
      },
    } = this;

    const claimedVouchersArray = Object.keys(claimedVouchers);

    const voucherList = Object.entries(appwideVouchers)
      .filter(
        ([voucherId, voucherData]) => !claimedVouchersArray.includes(voucherId),
      )
      .map(([voucherId, voucherData]) => {
        return {voucherId, ...voucherData};
      });

    const claimedVoucherList = claimedVouchersArray.map((voucherId) => {
      return {voucherId, ...appwideVouchers[voucherId]};
    });

    return (
      <View style={{flex: 1}}>
        <BaseHeader title="Vouchers" backButton navigation={navigation} />

        <VouchersTab
          VoucherList={() => <VoucherList vouchers={voucherList} />}
          ClaimedVoucherList={() => (
            <VoucherList vouchers={claimedVoucherList} keyPrefix="claimed" />
          )}
        />
      </View>
    );
  }
}

export default VouchersScreen;
