/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {Provider} from 'mobx-react';
import SplashScreen from 'react-native-splash-screen';
import _ from 'lodash';
import moment from 'moment';

global._ = _;
global.moment = moment;

import GeneralStore from './src/store/generalStore';
import AuthStore from './src/store/authStore';
import ShopStore from './src/store/shopStore';

import Setup from './src/boot/setup';
import {AppState} from 'react-native';

const generalStore = (window.store = new GeneralStore());
const authStore = (window.store = new AuthStore());
const shopStore = (window.store = new ShopStore());
export default class App extends React.Component {
  componentDidMount() {
    authStore
      .checkAuthStatus()
      .then(() => {
        AppState.addEventListener('change', (state) => {
          if (state === 'active') {
            shopStore.getCartItems();
          } else if (state === 'background') {
            if (shopStore.unsubscribeToGetCartItems) {
              shopStore.unsubscribeToGetCartItems();
            }
          } else if (state === 'inactive') {
            if (shopStore.unsubscribeToGetCartItems) {
              shopStore.unsubscribeToGetCartItems();
            }
          }
        });
      })
      .then(() => {
        SplashScreen.hide();
      });
  }

  render() {
    return (
      <Provider
        generalStore={generalStore}
        authStore={authStore}
        shopStore={shopStore}>
        <Setup />
      </Provider>
    );
  }
}
