import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainDrawer from './MainDrawer';
import AuthStack from './AuthStack';

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
      </StackMain.Navigator>
    );
  }
}

export default MainStack;
