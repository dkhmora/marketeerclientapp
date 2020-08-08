import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import GiftedChat from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import Geolocation from '@react-native-community/geolocation';
import geohash from 'ngeohash';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import {Platform, PermissionsAndroid} from 'react-native';
import Toast from '../components/Toast';
import {persist} from 'mobx-persist';

const functions = firebase.app().functions('asia-northeast1');
class generalStore {
  @observable appReady = false;
  @persist('list') @observable orders = [];
  @persist @observable maxOrderUpdatedAt = 0;
  @observable orderItems = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;
  @observable currentLocation = null;
  @observable currentLocationDetails = null;
  @observable deliverToCurrentLocation = false;
  @observable deliverToLastDeliveryLocation = true;
  @observable deliverToSetLocation = false;
  @observable currentLocationGeohash = null;
  @observable userDetails = {};
  @observable addressLoading = false;
  @observable navigation = null;

  @action async getStoreReviews(merchantId) {
    const storeOrderReviewsRef = firestore()
      .collection('merchants')
      .doc(merchantId)
      .collection('order_reviews');

    return await storeOrderReviewsRef
      .get()
      .then((querySnapshot) => {
        const data = [];

        querySnapshot.forEach((doc, index) => {
          if (doc.id !== 'reviewNumber') {
            data.push(...doc.data().reviews);
          }
        });

        return data;
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async addReview({review}) {
    return await functions
      .httpsCallable('addReview')({
        ...review,
      })
      .then((response) => {
        if (response.data.s === 200) {
          Toast({text: 'Successfully submitted review'});
        } else {
          Toast({
            text: response.data.m,
            type: 'danger',
          });
        }
      })
      .catch((err) => {
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getAddressFromCoordinates({latitude, longitude}) {
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
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
      } else {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then((granted) => {
          if (granted !== 'granted') {
            Toast({
              text:
                'Error, location permissions is required. Please enable location permissions.',
              duration: 8000,
              type: 'danger',
              buttonText: 'Okay',
            });
          }
        });
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          resolve(position.coords);
        },
        (err) => {
          Toast({text: err.message, type: 'danger'});
          reject();
        },
        {
          timeout: 20000,
        },
      );
    });
  }

  @action async setCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
      } else {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then((granted) => {
          if (granted !== 'granted') {
            Toast({
              text:
                'Error, location permissions is required. Please enable location permissions.',
              duration: 8000,
              type: 'danger',
              buttonText: 'Okay',
            });
          }
        });
      }

      this.addressLoading = true;

      Geolocation.getCurrentPosition(
        async (position) => {
          this.deliverToCurrentLocation = true;
          this.deliverToSetLocation = false;
          this.deliverToLastDeliveryLocation = false;

          const coords = {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          };

          this.currentLocationGeohash = geohash.encode(
            coords.latitude,
            coords.longitude,
            12,
          );

          this.currentLocationDetails = await this.getAddressFromCoordinates({
            ...coords,
          });

          this.currentLocation = {...coords};

          resolve();
        },
        (err) => {
          Toast({text: err.message, type: 'danger'});

          if (err.code === 2) {
            Toast({
              text:
                'Error: Cannot get location coordinates. Please set your coordinates manually.',
              duration: 8000,
              type: 'danger',
              buttonText: 'Okay',
            });
          }

          if (this.navigation) {
            this.appReady = true;
            this.addressLoading = false;
            this.navigation.navigate('Set Location', {
              checkout: false,
              locationError: true,
            });
          }

          reject();
        },
        {
          timeout: 20000,
        },
      );
    }).then(() => {
      this.addressLoading = false;
    });
  }

  @action async setLastDeliveryLocation() {
    return new Promise((resolve, reject) => {
      this.deliverToCurrentLocation = false;
      this.deliverToSetLocation = false;
      this.deliverToLastDeliveryLocation = true;

      this.currentLocationGeohash = this.userDetails.lastDeliveryLocationGeohash;
      this.currentLocation = this.userDetails.lastDeliveryLocation;
      this.currentLocationDetails = this.userDetails.lastDeliveryLocationAddress;

      resolve();
    });
  }

  @action async getUserDetails(userId) {
    await firestore()
      .collection('users')
      .doc(userId)
      .get()
      .then((document) => {
        if (document.exists) {
          this.userDetails = document.data();
        }

        return null;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async updateCoordinates(
    userId,
    coordinates,
    lastDeliveryLocationGeohash,
    lastDeliveryLocationAddress,
  ) {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        lastDeliveryLocation: {...coordinates},
        lastDeliveryLocationGeohash,
        lastDeliveryLocationAddress,
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async getImageURI(imageRef) {
    if (imageRef) {
      const ref = storage().ref(imageRef);
      const link = await ref.getDownloadURL();
      return link;
    }
    return 0;
  }

  @action async getImageUrl(imageRef) {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();

    return link;
  }

  @action getMessages(orderId) {
    this.unsubscribeGetMessages && this.unsubscribeGetMessages();
    this.orderMessages = [];

    this.unsubscribeGetMessages = firestore()
      .collection('orders')
      .doc(orderId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot.exists) {
          if (
            documentSnapshot.data().messages.length <= 0 &&
            this.orderMessages.length > 0
          ) {
            this.orderMessages = GiftedChat.append(
              this.orderMessages,
              documentSnapshot.data().messages,
            );
          } else {
            this.orderMessages = documentSnapshot.data().messages.reverse();
          }
        }
      });
  }

  @action async sendMessage(orderId, message) {
    const createdAt = Date.parse(message.createdAt);
    message.createdAt = createdAt;

    await firestore()
      .collection('orders')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async createImageMessage(orderId, messageId, user, imageLink) {
    const createdAt = new Date().getTime();
    const message = {
      _id: messageId,
      image: imageLink,
      user,
      createdAt,
    };

    await firestore()
      .collection('orders')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async sendImage(
    orderId,
    customerUserId,
    merchantId,
    user,
    imagePath,
  ) {
    const messageId = uuidv4();
    const imageRef = `/images/orders/${orderId}/order_chat/${messageId}`;
    const storageRef = storage().ref(imageRef);

    await storageRef
      .putFile(imagePath)
      .then(() => {
        storageRef.updateMetadata({
          customMetadata: {
            customerUserId,
            merchantId,
          },
        });
      })
      .then(() => {
        return this.getImageUrl(imageRef);
      })
      .then((imageLink) =>
        this.createImageMessage(orderId, messageId, user, imageLink),
      )
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async setOrders(userId) {
    return await firestore()
      .collection('orders')
      .where('userId', '==', userId)
      .where('updatedAt', '>', this.maxOrderUpdatedAt)
      .orderBy('updatedAt', 'desc')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc, index) => {
          const order = {...doc.data(), orderId: doc.id};

          if (order.updatedAt > this.maxOrderUpdatedAt) {
            this.maxOrderUpdatedAt = order.updatedAt;
          }

          const existingOrderIndex = this.orders
            .slice()
            .findIndex((existingOrder) => existingOrder.orderId === doc.id);

          if (existingOrderIndex >= 0) {
            this.orders[existingOrderIndex] = order;
          } else {
            this.orders.push(order);
          }
        });

        this.orders = this.orders
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt);
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async setOrderItems(orderId) {
    await firestore()
      .collection('order_items')
      .doc(orderId)
      .get()
      .then((document) => {
        return (this.orderItems = document.data().items);
      });
  }

  @action async getOrderItems(orderId) {
    const orderItems = await firestore()
      .collection('order_items')
      .doc(orderId)
      .get()
      .then((document) => {
        if (document.exists) {
          return document.data().items;
        }
      });

    return orderItems;
  }
}

export default generalStore;
