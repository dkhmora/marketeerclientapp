import React, {Component} from 'react';
import {FlatList, View, ScrollView} from 'react-native';
import {Card, Text, ListItem} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import CartListItem from './CartListItem';

@inject('shopStore')
@observer
class CartStoreList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const dataSource = this.props.shopStore.cartStores.slice();

    return (
      <ScrollView style={{flex: 1}}>
        {dataSource.map((storeName, index) => {
          const cartItems = this.props.shopStore.storeCartItems[
            storeName
          ].slice();

          return (
            <Card
              containerStyle={{margin: 0, borderRadius: 10, elevation: 5}}
              key={index}>
              <View>
                <Text>{storeName}</Text>
              </View>
              <View>
                {cartItems.map((item, cartIndex) => {
                  return <CartListItem item={item} key={cartIndex} />;
                })}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    );
  }
}

export default CartStoreList;
