/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {Provider, observer} from 'mobx-react';
import SplashScreen from 'react-native-splash-screen';
import _ from 'lodash';
import moment from 'moment';
import auth from '@react-native-firebase/auth';

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
@observer
class App extends React.Component {
  componentDidMount() {
    this.authState = auth().onAuthStateChanged((user) => {
      authStore
        .checkAuthStatus()
        .then(() => {
          if (!authStore.guest) {
            shopStore.getCartItems(user);
          }

          AppState.addEventListener('change', (state) => {
            if (!authStore.guest) {
              if (state === 'active') {
                console.log('active state');
                shopStore.getCartItems(user);
              } else if (state === 'background') {
                if (shopStore.unsubscribeToGetCartItems) {
                  shopStore.unsubscribeToGetCartItems();
                }
              } else if (state === 'inactive') {
                if (shopStore.unsubscribeToGetCartItems) {
                  shopStore.unsubscribeToGetCartItems();
                }
              }
            }
          });
        })
        .then(() => {
          this.splashScreenTimer = setTimeout(
            this.hideSplashScreen.bind(this),
            1000,
          );
        });
    });
  }

  componentWillUnmount() {
    this.authState();
  }

  hideSplashScreen() {
    SplashScreen.hide();
    this.splashScreenTimer && clearTimeout(this.splashScreenTimer);
  }

  render() {
    if (authStore.userAuthenticated) {
      return (
        <Provider
          generalStore={generalStore}
          authStore={authStore}
          shopStore={shopStore}>
          <Setup />
        </Provider>
      );
    } else {
      return null;
    }
  }
}

export default App;
