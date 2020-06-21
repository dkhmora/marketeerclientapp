import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';

const StackAuth = createStackNavigator();

class AuthStack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <StackAuth.Navigator initialRouteName="Login" headerMode="none">
        <StackAuth.Screen name="Login" component={LoginScreen} />
        <StackAuth.Screen name="Sign Up" component={SignUpScreen} />
        <StackAuth.Screen
          name="Phone Verification"
          component={PhoneVerificationScreen}
        />
      </StackAuth.Navigator>
    );
  }
}

export default AuthStack;
