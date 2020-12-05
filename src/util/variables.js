import firestore from '@react-native-firebase/firestore';

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
};
