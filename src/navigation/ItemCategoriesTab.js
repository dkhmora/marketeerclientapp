import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import {View, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-elements';
import {computed} from 'mobx';
import {colors} from '../../assets/colors';

const ItemTab = createMaterialTopTabNavigator();

class ItemCategoriesTab extends Component {
  constructor(props) {
    super(props);
  }

  @computed get scrollEnabled() {
    const {storeCategoryItems} = this.props;

    return storeCategoryItems && storeCategoryItems.size > 4 ? true : false;
  }

  TabScreens(storeCategoryItems) {
    const {merchantId} = this.props;
    const tabs = [];

    storeCategoryItems.forEach((key, value) => {
      tabs.push(
        <ItemTab.Screen
          name={value}
          component={ItemsList}
          initialParams={{
            items: key,
            merchantId,
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
          <ItemTab.Navigator
            tabBarOptions={{
              scrollEnabled,
              indicatorStyle: {width: '10%', left: '7.5%'},
            }}>
            {storeCategoryItems && this.TabScreens(storeCategoryItems)}
          </ItemTab.Navigator>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
}

export default ItemCategoriesTab;
