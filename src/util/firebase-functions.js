import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import Toast from '../components/Toast';

const functions = firebase.app().functions('asia-northeast1');

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

export {
  getAddressFromCoordinates,
  addReview,
  cancelOrder,
  placeOrder,
  getUserMrSpeedyDeliveryPriceEstimate,
};
