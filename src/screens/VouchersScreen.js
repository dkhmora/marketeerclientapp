import {computed} from 'mobx';
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

  @computed get voucherLists() {
    const {
      props: {
        generalStore: {
          appwideVouchers,
          userDetails: {claimedVouchers},
        },
      },
    } = this;

    const unclaimed = [];
    const claimed = [];

    if (appwideVouchers !== undefined) {
      Object.entries(appwideVouchers).map(([voucherId, voucherData]) => {
        if (
          claimedVouchers?.[voucherId] === undefined &&
          voucherData?.disabled !== true
        ) {
          return unclaimed.push({voucherId, ...voucherData});
        }

        return claimed.push({voucherId, ...voucherData});
      });
    }

    return {
      unclaimed,
      claimed,
    };
  }

  componentDidMount() {
    this.props.generalStore.setAppData();
  }

  render() {
    const {
      props: {navigation},
      voucherLists: {unclaimed, claimed},
    } = this;

    return (
      <View style={{flex: 1}}>
        <BaseHeader title="Vouchers" backButton navigation={navigation} />

        <VouchersTab
          VoucherList={() => <VoucherList vouchers={unclaimed} />}
          ClaimedVoucherList={() => (
            <VoucherList vouchers={claimed} keyPrefix="claimed" />
          )}
        />
      </View>
    );
  }
}

export default VouchersScreen;
