import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import GiftedChat from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import Geolocation from 'react-native-geolocation-service';
import geohash from 'ngeohash';
import auth from '@react-native-firebase/auth';
import {Platform} from 'react-native';
import Toast from '../components/Toast';
import {persist} from 'mobx-persist';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import {getAddressFromCoordinates} from '../util/firebase-functions';
import {nowMillis} from '../util/variables';
import {check, PERMISSIONS} from 'react-native-permissions';

class generalStore {
  @observable appReady = false;
  @persist('list') @observable orders = [];
  @persist @observable maxOrderUpdatedAt = 0;
  @persist @observable firstLoad = true;
  @observable orderItems = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;
  @observable unsubscribeGetOrder = null;
  @observable selectedOrder = null;
  @observable currentLocation = null;
  @observable currentLocationDetails = null;
  @observable selectedDeliveryLabel = null;
  @observable currentLocationGeohash = null;
  @observable userDetails = {};
  @observable addressLoading = false;
  @observable navigation = null;
  @observable storeCategories = [];
  @observable availablePaymentMethods = {};
  @observable appwideVouchers = {};
  @observable useableVoucherIds = {};
  @observable getCourierInterval = null;
  @observable startupModalProps = {};
  @observable initialLink = null;
  @observable additionalPaymentMethods = {
    COD: {
      longName: 'Cash On Delivery',
      shortName: 'COD',
      remarks: 'Pay in cash when you receive your order!',
      cost: 0,
      currencies: 'PHP',
      status: 'A',
      surcharge: 0,
    },
  };

  @computed get voucherLists() {
    const {
      appwideVouchers,
      userDetails: {claimedVouchers},
    } = this;

    const unclaimed = [];
    const claimed = [];

    if (appwideVouchers !== undefined) {
      Object.entries(appwideVouchers).map(([voucherId, voucherData]) => {
        if (voucherData?.disabled !== true) {
          if (claimedVouchers?.[voucherId] === undefined) {
            return unclaimed.push({voucherId, ...voucherData});
          }

          return claimed.push({voucherId, ...voucherData});
        }
      });
    }

    return {
      unclaimed,
      claimed,
    };
  }

  @action useVoucher(voucherId, {voucherIsSelected, voucherIsApplicable}) {
    if (
      (voucherIsSelected && !voucherIsApplicable) ||
      (voucherIsSelected && voucherIsApplicable)
    ) {
      this.useableVoucherIds[voucherId] += 1;
    }
    if (!voucherIsSelected && voucherIsApplicable) {
      this.useableVoucherIds[voucherId] -= 1;
    }
  }

  @action toggleAppLoader() {
    return new Promise((res) => {
      res((this.appReady = !this.appReady));
    });
  }

  @action clearGetCourierInterval() {
    clearInterval(this.getCourierInterval);
    this.getCourierInterval = null;
  }

  @action async setAppData() {
    return await firestore()
      .collection('application')
      .doc('client_config')
      .get()
      .then(async (document) => {
        if (document.exists) {
          const {
            availablePaymentMethods,
            storeCategories,
            vouchers,
            startupModalProps,
          } = document.data();
          if (storeCategories) {
            this.storeCategories = storeCategories.sort(
              (a, b) => a.name > b.name,
            );
          }

          if (availablePaymentMethods) {
            let sortedAvailablePaymentMethods = {};

            await Object.entries(availablePaymentMethods)
              .sort((a, b) => a[1].longName > b[1].longName)
              .map(([key, value], index) => {
                sortedAvailablePaymentMethods[key] = value;
              });

            this.availablePaymentMethods = {
              ...this.additionalPaymentMethods,
              ...sortedAvailablePaymentMethods,
            };
          }

          if (vouchers) {
            this.appwideVouchers = vouchers;
          }

          if (startupModalProps) {
            this.startupModalProps = startupModalProps;
          }
        }
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async subscribeToNotifications() {
    const userId = auth().currentUser.uid;
    const guest = auth().currentUser.isAnonymous;

    if (!guest) {
      return await messaging()
        .getToken()
        .then((token) => {
          if (
            this.userDetails?.fcmTokens === undefined ||
            !this.userDetails.fcmTokens.includes(token)
          ) {
            firestore()
              .collection('users')
              .doc(userId)
              .update('fcmTokens', firestore.FieldValue.arrayUnion(token));
          }
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  @action async getStoreReviews(storeId) {
    const storeOrderReviewsRef = firestore()
      .collection('stores')
      .doc(storeId)
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
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action getUserLocation() {
    return new Promise((resolve, reject) => {
      const platformLocationPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      return check(platformLocationPermission).then((permissionResult) => {
        if (permissionResult === 'granted') {
          return Geolocation.getCurrentPosition(
            (position) => {
              resolve(position.coords);
            },
            (err) => {
              crashlytics().recordError(err);
              Toast({text: err.message, type: 'danger'});
              return;
            },
            {
              timeout: 20000,
            },
          );
        }
      });
    });
  }

  @action async setCurrentLocation() {
    this.addressLoading = true;
    const platformLocationPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    return check(platformLocationPermission).then((permissionResult) => {
      if (permissionResult === 'granted') {
        return Geolocation.getCurrentPosition(
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

            this.currentLocationDetails = await getAddressFromCoordinates({
              ...coords,
            });

            this.currentLocation = {...coords};

            this.appReady = true;
            this.addressLoading = false;
          },
          (err) => {
            crashlytics().recordError(err);

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
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      } else {
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

  @action async setLastDeliveryLocation() {
    return new Promise((resolve, reject) => {
      this.selectedDeliveryLabel = 'Last Delivery Location';

      this.currentLocationGeohash = this.userDetails?.addresses?.Home?.geohash;
      this.currentLocation = this.userDetails?.addresses?.Home?.coordinates;
      this.currentLocationDetails = this.userDetails?.addresses?.Home?.address;

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

              this.subscribeToNotifications();
            }
          } else {
            this.unsubscribeUserDetails();
          }

          return null;
        });
    }
  }

  @action async getImageUrl(imageRef) {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL().catch((err) => {
      return null;
    });

    return link;
  }

  @action async markMessagesAsRead(orderId) {
    this.markMessagesAsReadTimeout &&
      clearTimeout(this.markMessagesAsReadTimeout);

    this.markMessagesAsReadTimeout = setTimeout(() => {
      firestore()
        .collection('orders')
        .doc(orderId)
        .update({
          userUnreadCount: 0,
          updatedAt: nowMillis,
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});

          return null;
        });
    }, 100);
  }

  @action getOrder({orderId, readMessages}) {
    this.orderMessages = null;
    this.selectedOrder = null;

    if (orderId) {
      this.unsubscribeGetOrder = firestore()
        .collection('orders')
        .doc(orderId)
        .onSnapshot((documentSnapshot) => {
          if (documentSnapshot) {
            if (documentSnapshot.exists) {
              this.orderMessages = [];

              if (
                documentSnapshot.data().userUnreadCount !== 0 &&
                readMessages
              ) {
                this.markMessagesAsRead(orderId);
              }

              this.selectedOrder = {...documentSnapshot.data(), orderId};

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
          }
        });
    }
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
        storeUnreadCount: firestore.FieldValue.increment(1),
        updatedAt: nowMillis,
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
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
        storeUnreadCount: firestore.FieldValue.increment(1),
        updatedAt: nowMillis,
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async sendImage(orderId, customerUserId, storeId, user, imagePath) {
    const messageId = uuidv4();
    const imageRef = `/images/orders/${orderId}/order_chat/${messageId}`;
    const storageRef = storage().ref(imageRef);

    await storageRef
      .putFile(imagePath, {
        customMetadata: {
          customerUserId,
          storeId,
        },
      })
      .then(() => {
        return this.getImageUrl(imageRef);
      })
      .then((imageLink) =>
        this.createImageMessage(orderId, messageId, user, imageLink),
      )
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
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
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }
}

export default generalStore;
