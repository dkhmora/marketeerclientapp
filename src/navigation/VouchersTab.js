import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../assets/colors';

const TabVouchers = createMaterialTopTabNavigator();

class VouchersTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      props: {VoucherList, ClaimedVoucherList},
    } = this;

    return (
      <TabVouchers.Navigator
        initialRouteName="Near You"
        gestureHandlerProps={{enabled: true}}
        tabBarOptions={{
          allowFontScaling: false,
          activeTintColor: colors.primary,
          inactiveTintColor: colors.text_secondary,
          tabStyle: {
            paddingTop: 0,
          },
          labelStyle: {
            marginTop: 0,
            fontFamily: 'ProductSans-Regular',
          },
          indicatorStyle: {
            width: '25%',
            left: '12.5%',
            height: 1,
            backgroundColor: colors.primary,
          },
          style: {
            backgroundColor: colors.icons,
            height: 35,
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
        <TabVouchers.Screen name="New" children={VoucherList} />
        <TabVouchers.Screen name="Claimed" component={ClaimedVoucherList} />
      </TabVouchers.Navigator>
    );
  }
}

export default VouchersTab;
