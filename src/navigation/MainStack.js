import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import StoreScreen from '../screens/StoreScreen';
import AuthStack from './AuthStack';
import StoreStack from './StoreStack';

class MainStack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const StackMain = createStackNavigator();

    return (
      <StackMain.Navigator initialRouteName="Home" headerMode="none">
        <StackMain.Screen name="Auth" component={AuthStack} />
        <StackMain.Screen name="Home" component={StoreStack} />
        <StackMain.Screen name="Store" component={StoreScreen} />
      </StackMain.Navigator>
    );
  }
}

export default MainStack;
