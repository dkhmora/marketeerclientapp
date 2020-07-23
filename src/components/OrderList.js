import React, {Component} from 'react';
import {
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  View,
} from 'react-native';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import * as Animatable from 'react-native-animatable';
import {Text} from 'react-native-elements';

@inject('authStore')
@inject('generalStore')
@observer
class OrderList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: true,
      loading: false,
    };
  }

  componentDidMount() {
    this.retrieveInitial();
  }

  retrieveInitial = () => {
    this.setState({loading: true});

    this.props.generalStore.setOrders(this.props.authStore.userId).then(() => {
      this.setState({
        loading: false,
      });
    });
  };

  onRefresh() {
    this.retrieveInitial();
  }

  render() {
    const {navigation} = this.props;
    const dataSource = this.props.generalStore.orders.slice();

    return (
      <FlatList
        style={{flex: 1, paddingHorizontal: 10}}
        contentContainerStyle={{flexGrow: 1}}
        data={dataSource}
        initialNumToRender={10}
        renderItem={({item, index}) => (
          <OrderCard order={item} navigation={navigation} key={index} />
        )}
        keyExtractor={(item) => item.orderId}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                paddingHorizontal: 15,
              }}>
              You haven't placed an order yet. Check out the best stores near
              your area and place an order now!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[colors.primary, colors.dark]}
            refreshing={this.state.loading}
            onRefresh={this.onRefresh.bind(this)}
          />
        }
      />
    );
  }
}

export default OrderList;
