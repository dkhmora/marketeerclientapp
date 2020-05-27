import React from 'react';
import {Root, StyleProvider} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {HomeScreen} from './screens/HomeScreen';
import getTheme from './theme/components';
import variables from './theme/variables/commonColor';

const StackMain = createStackNavigator();

export default () => (
  <Root>
    <NavigationContainer>
      <StackMain.Navigator initialRouteName="Home" headerMode="none">
        <StackMain.Screen name="Home" component={HomeScreen} />
      </StackMain.Navigator>
    </NavigationContainer>
  </Root>
);
