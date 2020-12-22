import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Text} from 'react-native-elements';
import {colors} from '../../../assets/colors';
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

  renderItem = ({item, index}) => {
    const {
      props: {
        navigation,
        orderAmount,
        keyPrefix,
        voucherSelected,
        onDeliveryVoucherPress,
      },
    } = this;

    return item.empty ? (
      <View
        style={{flex: 1, backgroundColor: 'transparent'}}
        key={`voucherEmpty${index}`}
      />
    ) : (
      <VoucherCard
        claimed={keyPrefix !== undefined}
        voucher={item}
        navigation={navigation}
        orderAmount={orderAmount}
        voucherSelected={voucherSelected}
        onDeliveryVoucherPress={onDeliveryVoucherPress}
        key={`${keyPrefix}${item.voucherId}`}
      />
    );
  };

  render() {
    const {
      props: {vouchers, keyPrefix, emptyText},
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
        style={{
          backgroundColor: colors.icons,
        }}
        contentContainerStyle={{paddingHorizontal: 10, flexGrow: 1}}
        keyExtractor={(item) => `${keyPrefix}${item.voucherId}`}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                paddingHorizontal: 15,
                fontSize: 18,
                fontFamily: 'ProductSans-Black',
              }}>
              {emptyText}
            </Text>
          </View>
        }
      />
    );
  }
}
