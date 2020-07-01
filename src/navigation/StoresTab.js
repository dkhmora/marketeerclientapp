import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import StoreCategoriesScreen from '../screens/StoreCategoriesScreen';
import StoreList from '../components/StoreList';
import {inject, observer} from 'mobx-react';

const TabStores = createMaterialTopTabNavigator();
@inject('shopStore')
@observer
class StoresTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const storeList = this.props.shopStore.storeList.slice();

    return (
      <TabStores.Navigator initialRouteName="Near You">
        <TabStores.Screen
          name="Near You"
          component={StoreList}
          initialParams={{dataSource: storeList}}
        />
        <TabStores.Screen name="Categories" component={StoreCategoriesScreen} />
      </TabStores.Navigator>
    );
  }
}

export default StoresTab;
