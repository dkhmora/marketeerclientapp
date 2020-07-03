import React, {Component} from 'react';
import {FlatList} from 'react-native';
import {Container, View} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';

@inject('authStore')
@inject('generalStore')
@observer
class OrderList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.generalStore.setOrders(this.props.authStore.userId);
  }

  render() {
    const {navigation} = this.props;
    const dataSource = this.props.generalStore.orders.slice();

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, flex: 1}}>
          <FlatList
            data={dataSource}
            renderItem={({item, index}) => (
              <OrderCard order={item} navigation={navigation} key={index} />
            )}
            keyExtractor={(item) => item.orderId}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Container>
    );
  }
}

export default OrderList;
