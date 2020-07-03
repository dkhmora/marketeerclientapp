import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';

const StackAuth = createStackNavigator();

class AuthStack extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkout: this.props.route.params
        ? this.props.route.params.checkout
        : false,
    };
  }

  render() {
    const {checkout} = this.state;

    return (
      <StackAuth.Navigator initialRouteName="Login" headerMode="none">
        <StackAuth.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{checkout}}
        />
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
