import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import {View, ActivityIndicator, Dimensions} from 'react-native';
import {computed} from 'mobx';
import {colors} from '../../assets/colors';

const ItemTab = createMaterialTopTabNavigator();
const SCREEN_WIDTH = Dimensions.get('screen').width;

class ItemCategoriesTab extends Component {
  constructor(props) {
    super(props);
  }

  @computed get tabWidth() {
    const {storeCategoryItems} = this.props;

    return storeCategoryItems && storeCategoryItems.size > 5
      ? 'auto'
      : SCREEN_WIDTH / storeCategoryItems.size;
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

    if (storeCategoryItems) {
      return (
        <View style={[style, {flex: 1}]}>
          <ItemTab.Navigator
            lazy
            lazyPreloadDistance={0.5}
            tabBarOptions={{
              scrollEnabled: true,
              tabStyle: {width: this.tabWidth},
              indicatorStyle: {
                backgroundColor: colors.primary,
              },
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
