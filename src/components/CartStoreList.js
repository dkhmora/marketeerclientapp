import React, {Component} from 'react';
import {View, ScrollView, FlatList} from 'react-native';
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

  renderItem = ({item, index}) => (
    <CartStoreCard
      cart={this.props.cart}
      checkout={this.props.checkout}
      storeId={item}
      key={item}
    />
  );

  render() {
    const dataSource = this.props.shopStore.cartStores.slice();
    const {emptyCartText, onTouchEnd, onTouchStart, onTouchCancel} = this.props;

    return (
      <FlatList
        onTouchEnd={() => onTouchEnd && onTouchEnd()}
        onTouchStart={() => onTouchStart && onTouchStart()}
        onTouchCancel={() => onTouchCancel && onTouchCancel()}
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
              {emptyCartText}
            </Text>
          </View>
        }
        data={dataSource ? dataSource : []}
        keyExtractor={(item, index) => item}
        renderItem={this.renderItem}
        contentContainerStyle={{flexGrow: 1}}
        style={{paddingHorizontal: 10, marginBottom: 65, marginVertical: -10}}
      />
    );
  }
}

export default CartStoreList;
