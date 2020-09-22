import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import StoreList from '../components/StoreList';
import {inject, observer} from 'mobx-react';
import StoreCategoryList from '../components/StoreCategoryList';
import {colors} from '../../assets/colors';

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
          tabStyle: {
            paddingTop: 0,
          },
          labelStyle: {marginTop: 0},
          activeTintColor: colors.primary,
          indicatorStyle: {
            width: '25%',
            left: '12.5%',
            backgroundColor: colors.primary,
            elevation: 7,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
          },
          style: {
            backgroundColor: colors.icons,
            height: 30,
            paddingTop: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 5,
          },
        }}>
        <TabStores.Screen name="Near You" component={StoreList} />
        <TabStores.Screen name="Categories" component={StoreCategoryList} />
      </TabStores.Navigator>
    );
  }
}

export default MainTab;
