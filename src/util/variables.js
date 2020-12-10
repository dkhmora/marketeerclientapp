import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';

const functions = firebase.app().functions('asia-northeast1');

if (process.env.DEVMODE === 'true') {
  console.log(
    'Firebase Functions Use Emulator at "http://192.168.86.231:5001"',
  );
  functions.useFunctionsEmulator('http://192.168.86.231:5001');
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

export {
  CDN_BASE_URL,
  nowMillis,
  contactUsUrl,
  privacyPolicyUrl,
  termsAndConditionsUrl,
  merchantSignUpUrl,
  daysList,
  functions,
};
