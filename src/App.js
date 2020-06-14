import React from 'react';
import {Root} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './navigation/MainStack';

export default () => (
  <Root>
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  </Root>
);
