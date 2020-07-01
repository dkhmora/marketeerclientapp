import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import {View} from 'react-native';
import {Text} from 'react-native-elements';

const ItemTab = createMaterialTopTabNavigator();

class ItemTabs extends Component {
  constructor(props) {
    super(props);
  }

  TabScreens(storeCategoryItems) {
    const {storeName} = this.props;
    const tabs = [];

    storeCategoryItems.forEach((key, value) => {
      tabs.push(
        <ItemTab.Screen
          name={value}
          component={ItemsList}
          initialParams={{
            items: key,
            storeName,
          }}
          key={value}
        />,
      );
    });

    return tabs;
  }

  render() {
    const {storeCategoryItems} = this.props;

    if (storeCategoryItems) {
      return (
        <View style={{flex: 1}}>
          <ItemTab.Navigator>
            {storeCategoryItems && this.TabScreens(storeCategoryItems)}
          </ItemTab.Navigator>
        </View>
      );
    }

    return (
      <View style={{flex: 1, paddingHorizontal: 15, paddingVertical: 20}}>
        <Text style={{fontSize: 18}}>
          Oh no! This store currently has no items yet. Please check back again
          later.
        </Text>
      </View>
    );
  }
}

export default ItemTabs;
