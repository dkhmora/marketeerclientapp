import React, {Component} from 'react';
import {FlatList, View, ScrollView} from 'react-native';
import {Card, Text, ListItem, Image} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import CartListItem from './CartListItem';
import {colors} from '../../assets/colors';
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
    const {emptyCartText, checkout} = this.props;

    return (
      <View style={{flex: 1}}>
        {dataSource.length > 0 ? (
          <ScrollView style={{flex: 1}}>
            {dataSource.map((storeName, index) => {
              return (
                <CartStoreCard
                  checkout={checkout}
                  storeName={storeName}
                  key={index}
                />
              );
            })}
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
