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
import VersionCheck from 'react-native-version-check';
import AsyncStorage from '@react-native-community/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

global._ = _;
global.moment = moment;

import GeneralStore from './src/store/generalStore';
import AuthStore from './src/store/authStore';
import ShopStore from './src/store/shopStore';

import Setup from './src/boot/setup';
import {
  ActivityIndicator,
  Linking,
  LogBox,
  Platform,
  StatusBar,
  View,
} from 'react-native';
import {create} from 'mobx-persist';

const hydrate = create({storage: AsyncStorage});
const generalStore = (window.store = new GeneralStore());
const authStore = (window.store = new AuthStore());
const shopStore = (window.store = new ShopStore());

import AlertModal from './src/components/AlertModal';
import {colors} from './assets/colors';

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
      appUrl: null,
      appUpdateModal: false,
      hydrated: false,
    };
  }

  componentDidMount() {
    crashlytics().sendUnsentReports();
    crashlytics().setCrashlyticsCollectionEnabled(true);
    crashlytics().log('App Mounted');

    const provider = Platform.OS === 'android' ? 'playStore' : 'appStore';

    Promise.all([
      hydrate('list', generalStore),
      hydrate('object', shopStore),
    ]).then(() => {
      this.setState({hydrated: true});
    });

    VersionCheck.needUpdate({
      provider,
      forceUpdate: true,
    })
      .then(async (res) => {
        if (res) {
          if (res.isNeeded) {
            this.setState({appUpdateModal: true, appUrl: res.storeUrl});
          } else {
            shopStore.unsubscribeToGetCartItems &&
              shopStore.unsubscribeToGetCartItems();

            setTimeout(() => SplashScreen.hide(), 200);
          }
        } else {
          shopStore.unsubscribeToGetCartItems &&
            shopStore.unsubscribeToGetCartItems();

          setTimeout(() => SplashScreen.hide(), 200);
        }
      })
      .then(() => (generalStore.appReady = true));
  }

  openAppUrl() {
    if (this.state.appUrl) {
      Linking.openURL(this.state.appUrl);
    }
  }

  render() {
    const {hydrated} = this.state;

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

        {hydrated ? (
          <Setup />
        ) : (
          <View
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
            }}>
            <StatusBar translucent backgroundColor={colors.primary} />
            <ActivityIndicator size="large" color={colors.icons} />
          </View>
        )}
      </Provider>
    );
  }
}

export default App;
