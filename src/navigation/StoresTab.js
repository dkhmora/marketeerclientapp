import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import StoreCategoriesScreen from '../screens/StoreCategoriesScreen';
import StoreList from '../components/StoreList';

const TabStores = createMaterialTopTabNavigator();

class StoresTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TabStores.Navigator initialRouteName="Near You">
        <TabStores.Screen name="Near You" component={StoreList} />
        <TabStores.Screen name="Categories" component={StoreCategoriesScreen} />
      </TabStores.Navigator>
    );
  }
}

export default StoresTab;
