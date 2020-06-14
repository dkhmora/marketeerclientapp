import React from 'react';
import {Root} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './navigation/MainStack';
import {colors} from '../assets/colors';

const NavigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: '#fff',
    card: '#fff',
    text: colors.text_primary,
    border: '#fff',
  },
};

export default () => (
  <Root>
    <NavigationContainer theme={NavigationTheme}>
      <MainStack />
    </NavigationContainer>
  </Root>
);
