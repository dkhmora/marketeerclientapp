import React, {Component} from 'react';
// Custom Components
import OrderList from '../components/OrderList';
import BaseHeader from '../components/BaseHeader';
import {inject, observer} from 'mobx-react';
import {View} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

@inject('authStore')
@observer
class OrdersScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    crashlytics().log('OrdersScreen');
  }

  render() {
    const {name} = this.props.route;
    const {navigation} = this.props;

    return (
      <View style={{flex: 1}}>
        <BaseHeader backButton title={name} navigation={navigation} />
        <OrderList navigation={navigation} />
      </View>
    );
  }
}

export default OrdersScreen;
