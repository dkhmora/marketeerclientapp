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
import VersionCheck from 'react-native-version-check';

global._ = _;
global.moment = moment;

import GeneralStore from './src/store/generalStore';
import AuthStore from './src/store/authStore';
import ShopStore from './src/store/shopStore';

import Setup from './src/boot/setup';
import {AppState, Linking} from 'react-native';

const generalStore = (window.store = new GeneralStore());
const authStore = (window.store = new AuthStore());
const shopStore = (window.store = new ShopStore());

// @TODO: This is to hide a Warning caused by NativeBase after upgrading to RN 0.62
import {YellowBox} from 'react-native';

YellowBox.ignoreWarnings([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
  'Animated.event now requires a second argument for options',
  'Require cycle: node_modules\\react-native-mapslibcomponentsMapView.js -> node_modules\\react-native-mapslibcomponentsGeojson.js -> node_modules\\react-native-mapslibcomponentsMapView.js',
  "Warning: Can't perform a React state update on an unmounted component.",
]);
// ------- END OF WARNING SUPPRESSION

@observer
class App extends React.Component {
  executeAuthStateListener() {
    this.authState = auth().onAuthStateChanged((user) => {
      authStore
        .checkAuthStatus()
        .then(() => {
          if (user) {
            const userId = user.uid;

            if (!authStore.guest) {
              authStore.reloadUser();
              shopStore.getCartItems(userId);
              authStore.getUserDetails().then(() => {
                if (authStore.userDetails.lastDeliveryLocation) {
                  generalStore.deliverToCurrentLocation = false;
                }
              });
            }

            AppState.addEventListener('change', (state) => {
              if (!authStore.guest) {
                if (state === 'active') {
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
          }
        })
        .then(() => {
          this.splashScreenTimer = setTimeout(
            this.hideSplashScreen.bind(this),
            1000,
          );
        });
    });
  }

  hideSplashScreen() {
    SplashScreen.hide();
    this.splashScreenTimer && clearTimeout(this.splashScreenTimer);
  }

  componentDidMount() {
    /* TODO: Remove comments before deploying in Play Store/App Store
    VersionCheck.needUpdate().then(async (res) => {
      if (res.isNeeded) {
        console.log('Update needed', res.isNeeded);
        // Linking.openURL(res.storeUrl); // open store if update is needed.
      } else {
        console.log('No update needed');
        this.executeAuthStateListener();
      }
    }); */

    shopStore.unsubscribeToGetCartItems &&
      shopStore.unsubscribeToGetCartItems();

    this.executeAuthStateListener();
  }

  componentWillUnmount() {
    this.authState();
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
