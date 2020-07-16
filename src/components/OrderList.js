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
      lastVisible: null,
      limit: 8,
      onEndReachedCalledDuringMomentum: false,
    };
  }

  componentDidMount() {
    this.retrieveInitial();
  }

  retrieveInitial = () => {
    this.setState({loading: true});

    const lastVisible =
      this.props.generalStore.orders.length > 0
        ? this.props.generalStore.orders[0].userOrderNumber -
          this.state.limit +
          1
        : 0;

    this.props.generalStore
      .setOrders(this.props.authStore.userId, this.state.limit)
      .then(() => {
        this.setState({
          loading: false,
          lastVisible,
        });
      });
  };

  retrieveMore = () => {
    if (
      !this.state.onEndReachedCalledDuringMomentum &&
      this.state.lastVisible >= 1
    ) {
      const {limit, lastVisible} = this.state;

      this.setState({refreshing: true, onEndReachedCalledDuringMomentum: true});

      this.props.generalStore
        .retrieveMoreOrders(this.props.authStore.userId, limit, lastVisible)
        .then(() => {
          this.setState({
            refreshing: false,
            lastVisible: this.state.lastVisible - this.state.limit,
            onEndReachedCalledDuringMomentum: false,
          });
        });
    }
  };

  renderFooter = () => {
    return (
      <View style={{bottom: 50, width: '100%'}}>
        {this.state.onEndReachedCalledDuringMomentum && (
          <Animatable.View
            animation="slideInUp"
            duration={400}
            useNativeDriver
            style={{
              alignItems: 'center',
              flex: 1,
            }}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{
                backgroundColor: colors.icons,
                borderRadius: 30,
                padding: 5,
                elevation: 5,
              }}
            />
          </Animatable.View>
        )}
      </View>
    );
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
        renderItem={({item, index}) => (
          <OrderCard order={item} navigation={navigation} key={index} />
        )}
        keyExtractor={(item) => item.orderId}
        showsVerticalScrollIndicator={false}
        onMomentumScrollBegin={() => {
          this.state.onEndReachedCalledDuringMomentum = false;
        }}
        onEndReached={this.retrieveMore}
        onEndReachedThreshold={0.01}
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
        refreshing={this.state.onEndReachedCalledDuringMomentum}
        ListFooterComponent={this.renderFooter}
      />
    );
  }
}

export default OrderList;
