import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import * as geolib from 'geolib';
import {persist} from 'mobx-persist';
import Toast from '../components/Toast';
import crashlytics from '@react-native-firebase/crashlytics';

const functions = firebase.app().functions('asia-northeast1');

const userCartCollection = firestore().collection('user_carts');
const storesCollection = firestore().collection('stores');
class shopStore {
  @persist('object') @observable allStoresMap = {};
  @persist @observable maxStoreUpdatedAt = 0;
  @observable storeCartItems = {};
  @observable storeDetails = {};
  @observable storeSelectedDeliveryMethod = {};
  @observable storeSelectedPaymentMethod = {};
  @observable storeAssignedMerchantId = {};
  @observable storeDeliveryDiscount = {};
  @observable storeUserEmail = {};
  @observable viewableStoreList = [];
  @observable itemCategories = [];
  @observable storeCategoryItems = new Map();
  @observable unsubscribeToGetCartItems = null;
  @observable cartUpdateTimeout = null;
  @observable validItemQuantity = {};
  @observable storeMrSpeedyDeliveryFee = {};

  @computed get totalCartItemQuantity() {
    let quantity = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map((storeId) => {
        this.storeCartItems[storeId].map((item) => {
          quantity = item.quantity + quantity;
        });
      });
    }

    return quantity;
  }

  @computed get validCheckout() {
    if (this.validItemQuantity) {
      if (Object.values(this.validItemQuantity).includes(false)) {
        return false;
      }
    }

    return true;
  }

  @computed get validStoreUserEmail() {
    const emailRegexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/,
    );

    if (Object.values(this.storeUserEmail).length > 0) {
      return Object.entries(this.storeUserEmail).map(([storeId, email]) => {
        if (
          this.storeSelectedPaymentMethod[storeId] !== 'COD' &&
          !emailRegexp.test(email)
        ) {
          return false;
        }

        return true;
      });
    }

    return true;
  }

  @computed get validPlaceOrder() {
    if (this.cartStores.length > 0) {
      const storeSelectedMethods = this.cartStores.map((storeId) => {
        if (!this.storeSelectedPaymentMethod[storeId]) {
          return false;
        }

        if (!this.storeSelectedDeliveryMethod[storeId]) {
          return false;
        }

        if (this.validStoreUserEmail.includes(false)) {
          return false;
        }

        return true;
      });

      if (storeSelectedMethods.includes(false)) {
        return false;
      }
    }

    return true;
  }

  @computed get totalCartSubTotalAmount() {
    let amount = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map(async (storeId) => {
        const storeDetails = this.allStoresMap[storeId];
        const selectedDelivery = this.storeSelectedDeliveryMethod[storeId];
        let storeTotal = 0;

        this.storeCartItems[storeId].map(async (item) => {
          const itemPrice = item.discountedPrice
            ? item.discountedPrice
            : item.price;
          let itemTotal = item.quantity * itemPrice;

          storeTotal += itemTotal;
        });

        if (selectedDelivery === 'Own Delivery') {
          const selectedDeliveryMethod =
            storeDetails.availableDeliveryMethods[selectedDelivery];
          const {discountAmount} = storeDetails.deliveryDiscount;
          const {deliveryPrice} = selectedDeliveryMethod;

          if (storeDetails.deliveryDiscount) {
            const {deliveryDiscount} = storeDetails;

            if (
              deliveryDiscount.activated &&
              storeTotal >= deliveryDiscount.minimumOrderAmount
            ) {
              amount -= Math.max(0, deliveryPrice - discountAmount);
            } else {
              amount += deliveryPrice;
            }
          } else {
            amount += deliveryPrice;
          }
        }

        amount += storeTotal;
      });

      return amount;
    }

    return 0;
  }

  @computed get totalAmountDisplay() {
    let lowerEstimate = this.totalCartSubTotalAmount;
    let upperEstimate = this.totalCartSubTotalAmount;

    if (
      this.storeCartItems &&
      Object.keys(this.storeSelectedDeliveryMethod).length > 0
    ) {
      Object.entries(this.storeSelectedDeliveryMethod).map(
        ([storeId, deliveryMethod]) => {
          if (deliveryMethod === 'Mr. Speedy') {
            const mrSpeedyDeliveryEstimates = this.storeMrSpeedyDeliveryFee[
              storeId
            ];
            const selectedPaymentMethod = this.storeSelectedPaymentMethod[
              storeId
            ];

            if (mrSpeedyDeliveryEstimates) {
              const motorbikeDeliveryFee =
                selectedPaymentMethod === 'COD'
                  ? Number(mrSpeedyDeliveryEstimates.motorbike) + 30
                  : Number(mrSpeedyDeliveryEstimates.motorbike);
              const carDeliveryFee =
                selectedPaymentMethod === 'COD'
                  ? Number(mrSpeedyDeliveryEstimates.car) + 30
                  : Number(mrSpeedyDeliveryEstimates.car);

              lowerEstimate += motorbikeDeliveryFee;
              upperEstimate += carDeliveryFee;
            }
          }
        },
      );

      if (upperEstimate === lowerEstimate) {
        return `₱${this.totalCartSubTotalAmount.toFixed(2)}`;
      }

      return `₱${lowerEstimate.toFixed(2)} - ₱${upperEstimate.toFixed(2)}`;
    }

    return 0;
  }

  @computed get cartStores() {
    if (this.storeCartItems) {
      const stores = [...Object.keys(this.storeCartItems)];

      return stores;
    }
    return [];
  }

  @action getCartItemIndex(item, storeId) {
    const storeCartItems = this.storeCartItems[storeId];

    return storeCartItems.findIndex((storeCartItem) => {
      if (item.cartId) {
        return storeCartItem.cartId === item.cartId;
      }

      return storeCartItem.itemId === item.itemId;
    });
  }

  @action async getMrSpeedyDeliveryPriceEstimate(
    deliveryLocation,
    deliveryAddress,
  ) {
    return await functions
      .httpsCallable('getUserMrSpeedyDeliveryPriceEstimate')({
        deliveryLocation,
        deliveryAddress,
      })
      .then((response) => {
        if (response.data.s === 200) {
          this.storeMrSpeedyDeliveryFee = response.data.d;

          return;
        }

        return Toast({text: response.data.m, type: 'danger'});
      })
      .catch((err) => Toast({text: err, type: 'danger'}));
  }

  @action async getStoreDetailsFromStoreId(storeId) {
    return await new Promise(async (resolve, reject) => {
      const storeDetails = await this.getStoreDetails(storeId);

      if (storeDetails) {
        return resolve(storeDetails);
      }

      return await firestore()
        .collection('stores')
        .doc(storeId)
        .get()
        .then((document) => {
          if (document.exists) {
            const store = {...document.data(), storeId: document.id};

            return resolve(store);
          }
        })
        .catch((err) => {
          crashlytics().recordError(err);
          return reject(err);
        });
    });
  }

  @action async setCartItems(userId) {
    firestore()
      .collection('user_carts')
      .doc(userId)
      .set({
        ...this.storeCartItems,
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});

        return null;
      });
  }

  @action async placeOrder({
    deliveryCoordinates,
    deliveryCoordinatesGeohash,
    deliveryAddress,
    userCoordinates,
    userName,
  }) {
    this.cartUpdateTimeout ? clearTimeout(this.cartUpdateTimeout) : null;

    const {
      storeDeliveryDiscount,
      storeSelectedDeliveryMethod,
      storeSelectedPaymentMethod,
      storeAssignedMerchantId,
      storeUserEmail,
    } = this;

    return await this.updateCartItemsInstantly()
      .then(async () => {
        return await functions.httpsCallable('placeOrder')({
          orderInfo: JSON.stringify({
            deliveryCoordinates,
            deliveryCoordinatesGeohash,
            deliveryAddress,
            userCoordinates,
            userName,
            storeUserEmail,
            storeSelectedDeliveryMethod,
            storeSelectedPaymentMethod,
            storeAssignedMerchantId,
            storeDeliveryDiscount,
          }),
        });
      })
      .then(async (response) => {
        this.getCartItems();

        return response;
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action resetData() {
    this.storeCartItems = {};
    this.storeSelectedDeliveryMethod = {};
    this.storeDeliveryDiscount = {};
    this.itemCategories = [];
  }

  @action getCartItemQuantity(item, storeId) {
    if (this.storeCartItems) {
      if (this.storeCartItems[storeId]) {
        const cartItem = this.storeCartItems[storeId].find(
          (storeCartItem) => storeCartItem.itemId === item.itemId,
        );

        if (cartItem) {
          return cartItem.quantity;
        }
      }
    }

    return 0;
  }

  @action getCartItems() {
    const userId = auth().currentUser.uid;

    this.unsubscribeToGetCartItems && this.unsubscribeToGetCartItems();

    this.unsubscribeToGetCartItems = userCartCollection
      .doc(userId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot) {
          this.storeCartItems = documentSnapshot.data()
            ? documentSnapshot.data()
            : {};
        }
      });
  }

  @action async addCartItemToStorage(item, storeId, options) {
    return new Promise((resolve, reject) => {
      const storeCartItems = this.storeCartItems[storeId];
      const dateNow = firestore.Timestamp.now().toMillis();

      item.sales && delete item.sales;
      item.options && delete item.options;

      if (!item.createdAt) {
        item.createdAt = dateNow;
      }
      item.updatedAt = dateNow;

      if (storeCartItems) {
        if (!options?.ignoreExistingCartItems) {
          const cartItemIndex = this.getCartItemIndex(item, storeId);

          if (cartItemIndex >= 0) {
            return resolve((storeCartItems[cartItemIndex] = item));
          }
        }

        resolve(storeCartItems.push(item));
      } else {
        resolve((this.storeCartItems[storeId] = [item]));
      }
    }).then(() => {
      if (options?.instantUpdate) {
        this.updateCartItemsInstantly();
      } else {
        this.updateCartItems();
      }
    });
  }

  @action async deleteCartItemInStorage(item, storeId, options) {
    const storeCartItems = this.storeCartItems[storeId];
    const dateNow = firestore.Timestamp.now().toMillis();

    if (storeCartItems) {
      const cartItemIndex = this.getCartItemIndex(item, storeId);

      if (cartItemIndex >= 0) {
        storeCartItems[cartItemIndex].quantity -= 1;
        storeCartItems[cartItemIndex].updatedAt = dateNow;

        if (storeCartItems[cartItemIndex].quantity <= 0) {
          storeCartItems.splice(cartItemIndex, 1);

          delete this.validItemQuantity[item.itemId];

          if (!this.storeCartItems[storeId].length) {
            delete this.storeCartItems[storeId];
          }
        }
      }

      if (options?.instantUpdate) {
        this.updateCartItemsInstantly();
      } else {
        this.updateCartItems();
      }
    }
  }

  @action async updateCartItems() {
    this.cartUpdateTimeout && clearTimeout(this.cartUpdateTimeout);

    this.cartUpdateTimeout = setTimeout(async () => {
      this.updateCartItemsInstantly();
    }, 2500);
  }

  @action async updateCartItemsInstantly() {
    const userId = auth().currentUser.uid;
    const guest = auth().currentUser.isAnonymous;

    if (userId && !guest) {
      await userCartCollection
        .doc(userId)
        .set({
          ...this.storeCartItems,
          //updatedAt: firestore.Timestamp.now().toMillis(),
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  @action async getStoreList({currentLocationGeohash, locationCoordinates}) {
    if (currentLocationGeohash && locationCoordinates) {
      return await storesCollection
        .where('visibleToPublic', '==', true)
        .where('updatedAt', '>', this.maxStoreUpdatedAt)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot, index) => {
            const storeId = documentSnapshot.id;
            const storeData = documentSnapshot.data();

            if (storeData.updatedAt > this.maxStoreUpdatedAt) {
              this.maxStoreUpdatedAt = storeData.updatedAt;
            }

            this.allStoresMap[storeId] = storeData;
          });
        })
        .then(async () => {
          this.viewableStoreList = await this.setVisibleStores(
            locationCoordinates,
          );
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    } else {
      Toast({
        text:
          'Error: No location coordinates set. Please set your location to view stores.',
        duration: 7000,
        type: 'danger',
      });
    }
  }

  @action async setVisibleStores(locationCoordinates) {
    const storeList = [];

    return await new Promise((resolve, reject) =>
      resolve(
        Object.entries(this.allStoresMap).map(([storeId, storeData]) => {
          const {
            deliveryCoordinates,
            storeLocation,
            vacationMode,
            creditThresholdReached,
          } = storeData;

          if (!vacationMode && !creditThresholdReached) {
            const isPointInPolygon =
              deliveryCoordinates && deliveryCoordinates.boundingBox
                ? geolib.isPointInPolygon(
                    {
                      latitude: locationCoordinates.latitude,
                      longitude: locationCoordinates.longitude,
                    },
                    [...deliveryCoordinates.boundingBox],
                  )
                : false;

            if (isPointInPolygon) {
              const distance = storeLocation
                ? geolib.getDistance(
                    {
                      latitude: locationCoordinates.latitude,
                      longitude: locationCoordinates.longitude,
                    },
                    {
                      latitude: storeLocation.latitude,
                      longitude: storeLocation.longitude,
                    },
                  )
                : null;

              const completeStoreData = {...storeData, storeId, distance};

              storeList.push(completeStoreData);
            }
          }
        }),
      ),
    ).then(async () => {
      const sortedList = await storeList.sort((a, b) => {
        return (
          (a.distance === null) - (b.distance === null) ||
          +(a.distance > b.distance) ||
          -(a.distance < b.distance)
        );
      });

      return sortedList;
    });
  }

  @action async setStoreItems(storeId, itemCategories) {
    const storeItemsCollection = firestore()
      .collection('stores')
      .doc(storeId)
      .collection('items');

    await storeItemsCollection
      .get()
      .then(async (querySnapshot) => {
        const allItems = [];

        if (!querySnapshot.empty) {
          await querySnapshot.forEach(async (doc, index) => {
            const newItems = doc.data().items;
            allItems.push(...newItems);
          });
        }

        return {allItems};
      })
      .then(({allItems}) => {
        const sortedItems = allItems.sort((a, b) => a.name > b.name);

        const categoryItems = new Map();
        categoryItems.set('All', sortedItems);

        if (itemCategories) {
          itemCategories.map((category) => {
            const items = sortedItems.filter(
              (item) => item.category === category,
            );

            categoryItems.set(category, items);
          });
        }

        return categoryItems;
      })
      .then((categoryItems) => {
        this.storeCategoryItems.set(storeId, categoryItems);
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }
}

export default shopStore;
