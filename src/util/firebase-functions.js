import firebase from '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';
import '@react-native-firebase/functions';
import Toast from '../components/Toast';

const functions = firebase.app().functions('asia-northeast1');

if (process.env.DEVMODE === 'true') {
  functions.useFunctionsEmulator('http://192.168.86.231:5001');
}

async function claimVoucher(voucherId) {
  return await functions
    .httpsCallable('claimVoucher')({voucherId})
    .then((response) => {
      if (response.data.s !== 200) {
        return Toast({
          text: response.data.m,
          type: 'danger',
        });
      }

      return Toast({text: response.data.m});
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function getAddressFromCoordinates({latitude, longitude}) {
  return await functions
    .httpsCallable('getAddressFromCoordinates')({latitude, longitude})
    .then((response) => {
      if (response.data.s !== 200) {
        Toast({
          text: response.data.m,
          type: 'danger',
        });
      }

      return response.data.locationDetails;
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function addReview({review}) {
  return await functions
    .httpsCallable('addReview')({
      ...review,
    })
    .then((response) => {
      if (response.data.s === 200) {
        Toast({text: 'Successfully submitted review'});
      } else {
        Toast({
          text: response.data.m
            ? response.data.m
            : 'Error: Something went wrong. Please try again later.',
          type: 'danger',
        });
      }
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function cancelOrder(orderId, cancelReason) {
  return await functions
    .httpsCallable('cancelOrder')({orderId, cancelReason})
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function placeOrder(orderInfo) {
  return await functions
    .httpsCallable('placeOrder')({
      orderInfo: JSON.stringify(orderInfo),
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function getUserMrSpeedyDeliveryPriceEstimate(deliveryData) {
  return await functions
    .httpsCallable('getUserMrSpeedyDeliveryPriceEstimate')(deliveryData)
    .then((response) => {
      if (response.data.s !== 200) {
        Toast({text: response.data.m, type: 'danger'});
      }

      return response;
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function signInWithPhoneAndPassword({phoneNumber, password}) {
  return await functions
    .httpsCallable('signInWithPhoneAndPassword')({
      phoneNumber,
      password,
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

export {
  claimVoucher,
  getAddressFromCoordinates,
  addReview,
  cancelOrder,
  placeOrder,
  getUserMrSpeedyDeliveryPriceEstimate,
  signInWithPhoneAndPassword,
};
