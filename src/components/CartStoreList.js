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

    return (
      <ScrollView style={{flex: 1}}>
        {dataSource.map((storeName, index) => {
          return <CartStoreCard storeName={storeName} key={index} />;
        })}
      </ScrollView>
    );
  }
}

export default CartStoreList;
