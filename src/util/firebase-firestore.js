import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import Toast from '../components/Toast';

async function getOrderDetails(orderId) {
  return await firestore()
    .collection('orders')
    .doc(orderId)
    .get()
    .then((document) => {
      if (document.exists) {
        return document.data();
      }
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });
}

async function getOrderPayment(orderId) {
  const orderPayment = await firestore()
    .collection('order_payments')
    .doc(orderId)
    .get()
    .then((document) => {
      if (document.exists) {
        return document.data();
      }
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});
    });

  return orderPayment;
}

async function getOrderItems(orderId) {
  return await firestore()
    .collection('order_items')
    .doc(orderId)
    .get()
    .then((document) => {
      if (document.exists) {
        return document.data().items;
      }
    })
    .catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});

      return null;
    });
}

export {getOrderDetails, getOrderPayment, getOrderItems};
