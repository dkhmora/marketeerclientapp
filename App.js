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
import AsyncStorage from '@react-native-community/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {requestNotifications} from 'react-native-permissions';

global._ = _;
global.moment = moment;

import GeneralStore from './src/store/generalStore';
import AuthStore from './src/store/authStore';
import ShopStore from './src/store/shopStore';

import Setup from './src/boot/setup';
import {AppState, Linking, LogBox, Platform} from 'react-native';
import {create} from 'mobx-persist';

const hydrate = create({storage: AsyncStorage});
const generalStore = (window.store = new GeneralStore());
const authStore = (window.store = new AuthStore());
const shopStore = (window.store = new ShopStore());
hydrate('list', generalStore);
hydrate('object', shopStore);

import AlertModal from './src/components/AlertModal';

LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
  '"message":"Parse Error.',
  'Warning: Failed prop type: Invalid prop `color` supplied to `Text`: hsl(208, 8%, 63%)',
]);
// ------- END OF WARNING SUPPRESSION
@observer
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      appUrl: null,
      appUpdateModal: false,
    };
  }

  executeAuthStateListener() {
    this.authState = auth().onAuthStateChanged((user) => {
      authStore.checkAuthStatus().then(() => {
        if (user) {
          const {isAnonymous, email, displayName, phoneNumber, uid} = user;

          this.setState({user}, () => {
            crashlytics().setAttributes({
              email,
              displayName,
              phoneNumber,
              uid,
              isAnonymous: isAnonymous.toString(),
            });
          });

          if (!authStore.guest) {
            authStore.reloadUser().then(() => {
              if (shopStore.cartStores.length !== 0) {
                shopStore.updateCartItemsInstantly().then(() => {
                  shopStore.getCartItems(uid);
                });
              } else {
                shopStore.getCartItems(uid);
              }

              requestNotifications(['alert', 'badge', 'sound', 'lockScreen'])
                .then(({status, settings}) => {
                  return generalStore.getUserDetails(uid);
                })
                .then(() => (generalStore.appReady = true));

              if (!generalStore.currentLocation) {
                return generalStore.setCurrentLocation();
              } else {
                return generalStore.setLastDeliveryLocation();
              }
            });
          } else {
            if (shopStore.unsubscribeToGetCartItems) {
              shopStore.unsubscribeToGetCartItems();
            }

            if (generalStore.unsubscribeUserDetails) {
              generalStore.unsubscribeUserDetails();
            }

            if (!generalStore.currentLocation) {
              return generalStore.setCurrentLocation();
            }
          }

          AppState.addEventListener('change', (state) => {
            if (!authStore.guest) {
              if (state === 'active') {
                if (!authStore.guest && user) {
                  shopStore.getCartItems(uid);
                  generalStore.getUserDetails(uid);
                }
              } else if (state === 'background') {
                if (shopStore.unsubscribeToGetCartItems) {
                  shopStore.unsubscribeToGetCartItems();
                }

                if (generalStore.unsubscribeUserDetails) {
                  generalStore.unsubscribeUserDetails();
                }
              } else if (state === 'inactive') {
                if (shopStore.unsubscribeToGetCartItems) {
                  shopStore.unsubscribeToGetCartItems();
                }

                if (generalStore.unsubscribeUserDetails) {
                  generalStore.unsubscribeUserDetails();
                }
              }
            }
          });
        }
      });
    });
  }

  componentDidMount() {
    crashlytics().sendUnsentReports();
    crashlytics().setCrashlyticsCollectionEnabled(true);
    crashlytics().log('App Mounted');

    const provider = Platform.OS === 'android' ? 'playStore' : 'appStore';

    VersionCheck.needUpdate({
      provider,
      forceUpdate: true,
    }).then(async (res) => {
      if (res) {
        if (res.isNeeded) {
          this.setState({appUpdateModal: true, appUrl: res.storeUrl});
        } else {
          shopStore.unsubscribeToGetCartItems &&
            shopStore.unsubscribeToGetCartItems();

          setTimeout(() => SplashScreen.hide(), 200);

          this.executeAuthStateListener();
        }
      } else {
        shopStore.unsubscribeToGetCartItems &&
          shopStore.unsubscribeToGetCartItems();

        setTimeout(() => SplashScreen.hide(), 200);

        this.executeAuthStateListener();
      }
    });
  }

  componentWillUnmount() {
    this.authState && this.authState();
  }

  openAppUrl() {
    if (this.state.appUrl) {
      Linking.openURL(this.state.appUrl);
    }
  }

  render() {
    return (
      <Provider
        generalStore={generalStore}
        authStore={authStore}
        shopStore={shopStore}>
        <AlertModal
          isVisible={this.state.appUpdateModal}
          onConfirm={() => {
            this.openAppUrl();
          }}
          buttonText={`Go to ${
            Platform.OS === 'android' ? 'Play Store' : 'App Store'
          }`}
          title="Please update Marketeer"
          body="Your Marketeer app is out of date. Please update in order to get all the latest features. Thank you."
        />

        {authStore.userAuthenticated && <Setup />}
      </Provider>
    );
  }
}

export default App;
