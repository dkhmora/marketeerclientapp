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

// @TODO: This is to hide a Warning caused by NativeBase after upgrading to RN 0.62
import {YellowBox} from 'react-native';

YellowBox.ignoreWarnings([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
]);
// ------- END OF WARNING SUPPRESSION

@observer
class App extends React.Component {
  componentDidMount() {
    this.authState = auth().onAuthStateChanged((user) => {
      authStore
        .checkAuthStatus()
        .then(() => {
          const userId = user.uid;

          if (!authStore.guest && user) {
            shopStore.getCartItems(userId);
          }

          AppState.addEventListener('change', (state) => {
            if (!authStore.guest) {
              if (state === 'active') {
                console.log('active state');
                if (!authStore.guest && user) {
                  shopStore.getCartItems(userId);
                }
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
