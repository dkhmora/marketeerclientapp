import React from 'react';
import {Root} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import AuthStack from './navigation/AuthStack';

const StackMain = createStackNavigator();

export default () => (
  <Root>
    <NavigationContainer>
      <StackMain.Navigator initialRouteName="Home" headerMode="none">
        <StackMain.Screen name="Auth" component={AuthStack} />
        <StackMain.Screen name="Home" component={HomeScreen} />
      </StackMain.Navigator>
    </NavigationContainer>
  </Root>
);
