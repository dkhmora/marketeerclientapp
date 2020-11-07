import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import StoreScreen from '../screens/StoreScreen';
import AuthStack from './AuthStack';
import CartScreen from '../screens/CartScreen';
import MainDrawer from './MainDrawer';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderChatScreen from '../screens/OrderChatScreen';
import SetLocationScreen from '../screens/SetLocationScreen';
import CategoryStoresScreen from '../screens/CategoryStoresScreen';
import AccountScreen from '../screens/AccountScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';
import FoodItemDetailsScreen from '../screens/FoodItemDetailsScreen';

class MainStack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const StackMain = createStackNavigator();

    return (
      <StackMain.Navigator initialRouteName="Home" headerMode="none">
        <StackMain.Screen name="Auth" component={AuthStack} />
        <StackMain.Screen name="Home" component={MainDrawer} />
        <StackMain.Screen name="Store" component={StoreScreen} />
        <StackMain.Screen name="Cart" component={CartScreen} />
        <StackMain.Screen name="Checkout" component={CheckoutScreen} />
        <StackMain.Screen name="Orders" component={OrdersScreen} />
        <StackMain.Screen name="Order Details" component={OrderDetailsScreen} />
        <StackMain.Screen name="Order Chat" component={OrderChatScreen} />
        <StackMain.Screen name="Set Location" component={SetLocationScreen} />
        <StackMain.Screen
          name="Category Stores"
          component={CategoryStoresScreen}
        />
        <StackMain.Screen name="Account" component={AccountScreen} />
        <StackMain.Screen
          name="Phone Verification"
          component={PhoneVerificationScreen}
        />
        <StackMain.Screen
          name="Food Item Details"
          component={FoodItemDetailsScreen}
        />
      </StackMain.Navigator>
    );
  }
}

export default MainStack;
