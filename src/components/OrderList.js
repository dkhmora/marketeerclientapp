import React, {Component} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {observer, inject} from 'mobx-react';
// Custom Components
import OrderCard from './OrderCard';
import {colors} from '../../assets/colors';
import {Text} from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';

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

  renderItem = ({item, index}) =>
    item.empty ? (
      <View
        style={{flex: 1, backgroundColor: 'transparent'}}
        key={item.itemId}
      />
    ) : (
      <OrderCard
        order={item}
        navigation={this.props.navigation}
        refresh={() => this.retrieveInitial()}
        key={item.orderId}
      />
    );

  render() {
    const dataSource = this.props.generalStore.orders.slice();
    const isTablet = DeviceInfo.isTablet();

    const numOfColumns = isTablet ? 2 : 1;

    return (
      <FlatList
        style={{flex: 1, paddingHorizontal: 5}}
        contentContainerStyle={{flexGrow: 1}}
        data={this.formatData(dataSource, numOfColumns)}
        numColumns={numOfColumns}
        initialNumToRender={10}
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
