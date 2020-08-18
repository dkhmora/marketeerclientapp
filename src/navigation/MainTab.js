import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import StoreList from '../components/StoreList';
import {inject, observer} from 'mobx-react';
import StoreCategoryList from '../components/StoreCategoryList';

const TabStores = createMaterialTopTabNavigator();
@inject('shopStore')
@observer
class MainTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TabStores.Navigator
        lazy
        lazyPreloadDistance={0.5}
        initialRouteName="Near You"
        tabBarOptions={{
          allowFontScaling: false,
          indicatorStyle: {width: '25%', left: '12.5%'},
          style: {
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
          },
        }}>
        <TabStores.Screen name="Near You" component={StoreList} />
        <TabStores.Screen name="Categories" component={StoreCategoryList} />
      </TabStores.Navigator>
    );
  }
}

export default MainTab;
