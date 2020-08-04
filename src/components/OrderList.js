import React, {Component} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
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

  renderItem = ({item, index}) => (
    <OrderCard
      order={item}
      navigation={this.props.navigation}
      key={item.orderId}
    />
  );

  render() {
    const dataSource = this.props.generalStore.orders.slice();

    return (
      <FlatList
        style={{flex: 1, paddingHorizontal: 10}}
        contentContainerStyle={{flexGrow: 1}}
        data={dataSource}
        initialNumToRender={1}
        renderItem={this.renderItem}
        windowSize={10}
        keyExtractor={(item) => item.orderId}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={5}
        ListEmptyComponent={
          !this.state.loading && (
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
          )
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
