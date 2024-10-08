import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import {Dimensions, StatusBar} from 'react-native';

const functions = firebase.app().functions('asia-northeast1');

if (process.env.DEVMODE === 'true') {
  console.log('Firebase Functions Use Emulator at "http://192.168.86.20:5001"');
  functions.useFunctionsEmulator('http://192.168.86.20:5001');
}

const contactUsUrl = 'https://marketeer.ph/components/pages/contactus';
const privacyPolicyUrl = 'https://marketeer.ph/components/pages/privacypolicy';
const termsAndConditionsUrl =
  'https://marketeer.ph/components/pages/termsandconditions';
const merchantSignUpUrl =
  'https://marketeer.ph/components/pages/partnermerchantsignup';

const CDN_BASE_URL = 'https://cdn.marketeer.ph';
const nowMillis = firestore.Timestamp.now().toMillis();
const daysList = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const dynamicLinkUrlActions = {
  store: 'https://marketeer.ph/store/',
  orderPaymentStatus: 'https://marketeer.ph/app/order/payment/',
  fbAd: 'https://marketeer.ph/app/fb/',
  igAd: 'https://marketeer.ph/app/ig/',
  twitAd: 'https://marketeer.ph/app/twit/',
};

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_DIMENSIONS = {
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width,
};

export {
  CDN_BASE_URL,
  nowMillis,
  contactUsUrl,
  privacyPolicyUrl,
  termsAndConditionsUrl,
  merchantSignUpUrl,
  daysList,
  functions,
  dynamicLinkUrlActions,
  STATUSBAR_HEIGHT,
  SCREEN_DIMENSIONS,
};
