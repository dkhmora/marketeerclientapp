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
    const tabLength = storeCategoryItems
      ? this.TabScreens(storeCategoryItems).length
      : 0;

    return tabLength > 2 ? 'auto' : SCREEN_WIDTH / tabLength;
  }

  TabScreens(storeCategoryItems) {
    const {storeId, storeType} = this.props;
    const tabs = [];

    storeCategoryItems.forEach((key, value) => {
      if (value !== '') {
        tabs.push(
          <ItemTab.Screen
            name={value}
            component={ItemsList}
            initialParams={{
              items: key,
              storeId,
              storeType,
            }}
            key={value}
          />,
        );
      }
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
            backBehavior="initialRoute"
            tabBarOptions={{
              allowFontScaling: false,
              scrollEnabled: true,
              activeTintColor: colors.icons,
              tabStyle: {
                width: this.tabWidth,
                paddingTop: 0,
              },
              labelStyle: {marginTop: 0},
              indicatorStyle: {
                backgroundColor: colors.icons,
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
                backgroundColor: colors.primary,
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
            {this.TabScreens(storeCategoryItems)}
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
