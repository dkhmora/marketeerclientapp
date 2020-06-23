import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainDrawer from './MainDrawer';
import CartScreen from '../screens/CartScreen';
import AuthStack from './AuthStack';

class StoreStack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const StackMain = createStackNavigator();

    return (
      <StackMain.Navigator initialRouteName="Home" headerMode="none">
        <StackMain.Screen name="Home" component={MainDrawer} />
        <StackMain.Screen name="Auth" component={AuthStack} />
        <StackMain.Screen name="Cart" component={CartScreen} />
      </StackMain.Navigator>
    );
  }
}

export default StoreStack;
