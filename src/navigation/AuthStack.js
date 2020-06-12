import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

const StackAuth = createStackNavigator();

class AuthStack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <StackAuth.Navigator initialRouteName="Login" headerMode="none">
        <StackAuth.Screen name="Login" component={LoginScreen} />
      </StackAuth.Navigator>
    );
  }
}

export default AuthStack;
