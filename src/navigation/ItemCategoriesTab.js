import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import {View} from 'react-native';
import {Text} from 'react-native-elements';
import {computed} from 'mobx';

const ItemTab = createMaterialTopTabNavigator();

class ItemCategoriesTab extends Component {
  constructor(props) {
    super(props);
  }

  @computed get scrollEnabled() {
    const {storeCategoryItems} = this.props;

    return storeCategoryItems && storeCategoryItems.size >= 3 ? true : false;
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
    const {storeCategoryItems, style} = this.props;
    const {scrollEnabled} = this;

    if (storeCategoryItems) {
      return (
        <View style={[style, {flex: 1}]}>
          <ItemTab.Navigator tabBarOptions={{scrollEnabled}}>
            {storeCategoryItems && this.TabScreens(storeCategoryItems)}
          </ItemTab.Navigator>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
          paddingVertical: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 18}}>
          Oh no! This store currently has no items yet. Please check back again
          later.
        </Text>
      </View>
    );
  }
}

export default ItemCategoriesTab;
