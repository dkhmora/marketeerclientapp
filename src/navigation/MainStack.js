import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import StoreScreen from '../screens/StoreScreen';
import AuthStack from './AuthStack';
import CartScreen from '../screens/CartScreen';
import MainDrawer from './MainDrawer';

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
      </StackMain.Navigator>
    );
  }
}

export default MainStack;
