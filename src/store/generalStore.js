import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import GiftedChat from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import Geolocation from '@react-native-community/geolocation';
import geohash from 'ngeohash';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import '@react-native-firebase/functions';
import {Platform, PermissionsAndroid} from 'react-native';
import Toast from '../components/Toast';
import {persist} from 'mobx-persist';
import messaging from '@react-native-firebase/messaging';

const functions = firebase.app().functions('asia-northeast1');
class generalStore {
  @observable appReady = false;
  @persist('list') @observable orders = [];
  @persist @observable maxOrderUpdatedAt = 0;
  @observable firstLoad = true;
  @observable orderItems = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;
  @observable currentLocation = null;
  @observable currentLocationDetails = null;
  @observable selectedDeliveryLabel = null;
  @observable currentLocationGeohash = null;
  @observable userDetails = {};
  @observable addressLoading = false;
  @observable navigation = null;

  @action async subscribeToNotifications() {
    let authorizationStatus = null;
    const userId = auth().currentUser.uid;
    const guest = auth().currentUser.isAnonymous;

    if (!guest) {
      if (Platform.OS === 'ios') {
        authorizationStatus = await messaging().requestPermission();
      } else {
        authorizationStatus = true;
      }

      if (authorizationStatus) {
        return await messaging()
          .getToken()
          .then((token) => {
            firestore()
              .collection('users')
              .doc(userId)
              .update('fcmTokens', firestore.FieldValue.arrayUnion(token));
          })
          .catch((err) => Toast({text: err.message, type: 'danger'}));
      }
    }
  }

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
            text: response.data.m
              ? response.data.m
              : 'Error: Something went wrong. Please try again later.',
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
                'Error: Location permissions not granted. Please set location manually.',
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
    return new Promise(async (resolve, reject) => {
      this.addressLoading = true;

      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then((granted) => {
          if (Platform.OS === 'android' && granted !== 'granted') {
            Toast({
              text:
                'Error: Location permissions not granted. Please set location manually.',
              duration: 6000,
              type: 'danger',
              buttonText: 'Okay',
            });

            if (this.navigation) {
              this.appReady = true;
              this.addressLoading = false;
              this.navigation.navigate('Set Location', {
                checkout: false,
                locationError: true,
              });
            }
          }
        });
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          this.selectedDeliveryLabel = 'Current Location';

          const coords = {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          };

          this.currentLocationGeohash = await geohash.encode(
            coords.latitude,
            coords.longitude,
            12,
          );

          this.currentLocationDetails = await this.getAddressFromCoordinates({
            ...coords,
          });

          this.currentLocation = {...coords};

          this.appReady = true;
          this.addressLoading = false;

          resolve();
        },
        (err) => {
          if (err.code === 2) {
            Toast({
              text:
                'Error: Cannot get location coordinates. Please set your coordinates manually.',
              duration: 6000,
              type: 'danger',
              buttonText: 'Okay',
            });
          } else {
            Toast({text: err.message, type: 'danger'});
          }

          if (this.navigation) {
            this.appReady = true;
            this.addressLoading = false;
            this.navigation.navigate('Set Location', {
              checkout: false,
              locationError: true,
            });
          }
        },
        {
          timeout: 20000,
        },
      );
    });
  }

  @action async setLastDeliveryLocation() {
    return new Promise((resolve, reject) => {
      this.selectedDeliveryLabel = 'Last Delivery Location';

      this.currentLocationGeohash = this.userDetails.addresses.Home.geohash;
      this.currentLocation = this.userDetails.addresses.Home.coordinates;
      this.currentLocationDetails = this.userDetails.addresses.Home.address;

      resolve();
    });
  }

  @action async getUserDetails() {
    const userId = auth().currentUser.uid;

    if (!auth().currentUser.isAnonymous) {
      this.unsubscribeUserDetails = firestore()
        .collection('users')
        .doc(userId)
        .onSnapshot(async (documentSnapshot) => {
          if (documentSnapshot) {
            if (documentSnapshot.exists) {
              this.userDetails = documentSnapshot.data();

              if (
                !documentSnapshot
                  .data()
                  .fcmTokens.includes(await messaging().getToken())
              ) {
                this.subscribeToNotifications();
              }

              if (this.firstLoad) {
                this.firstLoad = false;

                if (documentSnapshot.data().addresses) {
                  return this.setLastDeliveryLocation();
                } else {
                  return this.setCurrentLocation();
                }
              }
            }
          } else {
            this.unsubscribeUserDetails();
          }

          return null;
        });
    }
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

  @action async markMessagesAsRead(orderId) {
    this.markMessagesAsReadTimeout &&
      clearTimeout(this.markMessagesAsReadTimeout);

    this.markMessagesAsReadTimeout = setTimeout(() => {
      firestore().collection('orders').doc(orderId).update({
        userUnreadCount: 0,
        updatedAt: firestore.Timestamp.now().toMillis(),
      });
    }, 100);
  }

  @action getMessages(orderId) {
    this.unsubscribeGetMessages && this.unsubscribeGetMessages();
    this.orderMessages = [];

    this.unsubscribeGetMessages = firestore()
      .collection('orders')
      .doc(orderId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot.exists) {
          if (documentSnapshot.data().userUnreadCount !== 0) {
            this.markMessagesAsRead(orderId);
          }

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
      .update({
        messages: firestore.FieldValue.arrayUnion(message),
        merchantUnreadCount: firestore.FieldValue.increment(1),
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
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
      .update({
        messages: firestore.FieldValue.arrayUnion(message),
        merchantUnreadCount: firestore.FieldValue.increment(1),
        updatedAt: firestore.Timestamp.now().toMillis(),
      })
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
      .putFile(imagePath, {
        customMetadata: {
          customerUserId,
          merchantId,
        },
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
