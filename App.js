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

global._ = _;
global.moment = moment;

import GeneralStore from './src/store/generalStore';
import AuthStore from './src/store/authStore';
import ShopStore from './src/store/shopStore';

import Setup from './src/boot/setup';
import {AppState, Linking, Platform} from 'react-native';
import {create} from 'mobx-persist';

const hydrate = create({storage: AsyncStorage});
const generalStore = (window.store = new GeneralStore());
const authStore = (window.store = new AuthStore());
const shopStore = (window.store = new ShopStore());
hydrate('list', generalStore);
hydrate('object', shopStore);
// @TODO: This is to hide a Warning caused by NativeBase after upgrading to RN 0.62
import {YellowBox} from 'react-native';
import AlertModal from './src/components/AlertModal';

YellowBox.ignoreWarnings([
  'Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`',
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
          this.setState({user});

          const userId = user.uid;

          if (!authStore.guest) {
            authStore.reloadUser();

            if (shopStore.cartStores.length !== 0) {
              shopStore.updateCartItemsInstantly().then(() => {
                shopStore.getCartItems(userId);
              });
            } else {
              shopStore.getCartItems(userId);
            }

            generalStore.getUserDetails(userId);

            generalStore.appReady = true;
          } else {
            if (shopStore.unsubscribeToGetCartItems) {
              shopStore.unsubscribeToGetCartItems();
            }

            if (generalStore.unsubscribeUserDetails) {
              generalStore.unsubscribeUserDetails();
            }

            generalStore.setCurrentLocation();
          }

          AppState.addEventListener('change', (state) => {
            if (!authStore.guest) {
              if (state === 'active') {
                if (!authStore.guest && user) {
                  shopStore.getCartItems(userId);
                  generalStore.getUserDetails(userId);
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
    this.authState();
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
