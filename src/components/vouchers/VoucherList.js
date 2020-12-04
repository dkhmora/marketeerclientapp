import React, {Component} from 'react';
import {View, Text, FlatList} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import VoucherCard from './VoucherCard';

export default class VoucherList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  formatData(data, numColumns) {
    const numberOfFullRows = Math.floor(data.length / numColumns);

    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      data.push({key: `blank-${numberOfElementsLastRow}`, empty: true});
      numberOfElementsLastRow += 1;
    }

    return data;
  }

  renderItem = ({item, index}) =>
    item.empty ? (
      <View
        style={{flex: 1, backgroundColor: 'transparent'}}
        key={`voucherEmpty${index}`}
      />
    ) : (
      <VoucherCard
        voucher={item}
        navigation={this.props.navigation}
        key={item.voucherId}
      />
    );

  render() {
    const {
      props: {vouchers, keyPrefix},
      formatData,
      renderItem,
    } = this;
    const isTablet = DeviceInfo.isTablet();
    const numOfColumns = isTablet ? 2 : 1;

    return (
      <FlatList
        data={formatData(vouchers, numOfColumns)}
        renderItem={renderItem}
        initialNumToRender={10}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{paddingHorizontal: 10, flexGrow: 1}}
        keyExtractor={(item) => `${keyPrefix}${item.voucherId}`}
      />
    );
  }
}
