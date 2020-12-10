import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './navigation/MainStack';
import {colors} from '../assets/colors';
import {RootSiblingParent} from 'react-native-root-siblings';
import StartupModal from './components/StartupModal';

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

    <StartupModal
      overlayStyle={{backgroundColor: colors.primary}}
      image="https://www.thespruce.com/thmb/OU4gLtjlsNF60n-CcXS11JclGHQ=/960x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/green-broadbill-58d017f53df78c3c4f3c9b4e.jpg"
    />
  </RootSiblingParent>
);
