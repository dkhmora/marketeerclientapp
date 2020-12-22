import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './navigation/MainStack';
import {colors} from '../assets/colors';
import {RootSiblingParent} from 'react-native-root-siblings';

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
  <RootSiblingParent>
    <NavigationContainer theme={NavigationTheme}>
      <MainStack />
    </NavigationContainer>
  </RootSiblingParent>
);
