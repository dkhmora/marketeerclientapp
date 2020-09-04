import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import {Text} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import CartStoreCard from './CartStoreCard';

@inject('shopStore')
@inject('generalStore')
@observer
class CartStoreList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const dataSource = this.props.shopStore.cartStores.slice();
    const {
      emptyCartText,
      checkout,
      onTouchEnd,
      onTouchStart,
      onTouchCancel,
      cart,
    } = this.props;

    return (
      <View style={{flex: 1, marginVertical: -10}}>
        {dataSource.length > 0 ? (
          <ScrollView
            style={{flex: 1}}
            onTouchEnd={() => onTouchEnd && onTouchEnd()}
            onTouchStart={() => onTouchStart && onTouchStart()}
            onTouchCancel={() => onTouchCancel && onTouchCancel()}>
            {dataSource.map((storeId, index) => {
              return (
                <CartStoreCard
                  cart={cart}
                  checkout={checkout}
                  storeId={storeId}
                  key={storeId}
                />
              );
            })}
            <View style={{height: 10}} />
          </ScrollView>
        ) : (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'ProductSans-Black',
                textAlign: 'center',
              }}>
              {emptyCartText}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

export default CartStoreList;
