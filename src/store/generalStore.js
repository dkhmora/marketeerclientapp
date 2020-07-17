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

const functions = firebase.app().functions('asia-northeast1');
class generalStore {
  @observable appReady = false;
  @observable orders = [];
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
        console.log(err);
      });
  }

  @action async addReview({review}) {
    return await functions
      .httpsCallable('addReview')({
        ...review,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @action async getAddressFromCoordinates({latitude, longitude}) {
    return await functions
      .httpsCallable('getAddressFromCoordinates')({latitude, longitude})
      .then((response) => {
        console.log(response);
        return response.data.locationDetails;
      })
      .catch((err) => {
        console.log(err);
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
          console.log(granted); // just to ensure that permissions were granted
        });
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          resolve(position.coords);
        },
        (err) => {
          console.log(err);
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
          if (granted === 'granted') {
            console.log(granted);
          } else {
            Toast({
              text:
                'Error, location permissions is required. Please enable location permissions.',
              duration: 0,
            });
          }
          console.log(granted); // just to ensure that permissions were granted
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

          console.log('dito', this.currentLocationGeohash);

          resolve();
        },
        (err) => {
          console.log(err);

          Toast({
            text: err,
            duration: 0,
          });

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
      .catch((err) => console.log(err));
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
      .then(() => console.log('Successfully updated user coordinates'))
      .catch((err) => console.log(err));
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
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
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
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
  }

  @action async sendImage(orderId, user, imagePath) {
    const messageId = uuidv4();
    const imageRef = `/images/orders/${orderId}/order_chat/${messageId}`;

    await storage()
      .ref(imageRef)
      .putFile(imagePath)
      .then(() => {
        return this.getImageUrl(imageRef);
      })
      .then((imageLink) =>
        this.createImageMessage(orderId, messageId, user, imageLink),
      )
      .then(() => console.log('Image successfully uploaded and sent!'))
      .catch((err) => console.log(err));
  }

  @action async setOrders(userId, limit) {
    return await firestore()
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('userOrderNumber', 'desc')
      .limit(limit)
      .get()
      .then((querySnapshot) => {
        const data = [];

        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });

        this.orders = data;
      })
      .catch((err) => console.log(err));
  }

  @action async retrieveMoreOrders(userId, limit, lastVisible) {
    return await firestore()
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('userOrderNumber', 'desc')
      .startAfter(lastVisible)
      .limit(limit)
      .get()
      .then((querySnapshot) => {
        const data = [];

        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });

        this.orders = [...this.orders, ...data];
      })
      .catch((err) => console.log(err));
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
