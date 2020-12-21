/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {});

if (process.env.DEVMODE === 'true') {
  firestore()
    .settings({ssl: false, host: '192.168.86.20:5000'})
    .then(() => console.log('Firestore Host "192.168.86.20:5000" set'));
}

AppRegistry.registerComponent(appName, () => App);
