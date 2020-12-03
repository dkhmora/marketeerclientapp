import firestore from '@react-native-firebase/firestore';

const CDN_BASE_URL = 'https://cdn.marketeer.ph';
const nowMillis = firestore.Timestamp.now().toMillis();

export {CDN_BASE_URL, nowMillis};
