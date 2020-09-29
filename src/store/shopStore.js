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
  @persist('object') @observable storeCartItems = {};
  @observable storeDetails = {};
  @observable storeSelectedDeliveryMethod = {};
  @observable storeSelectedPaymentMethod = {};
  @observable storeAssignedMerchantId = {};
  @observable storeUserEmail = {};
  @observable storeList = [];
  @observable categoryStoreList = {};
  @observable itemCategories = [];
  @observable storeCategoryItems = new Map();
  @observable unsubscribeToGetCartItems = null;
  @observable cartUpdateTimeout = null;
  @observable storeFetchLimit = 8;
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
        const storeDetails = this.getStoreDetails(storeId);
        let storeTotal = 0;

        this.storeCartItems[storeId].map(async (item) => {
          let itemTotal = item.quantity * item.price;

          storeTotal += itemTotal;
        });

        if (this.storeSelectedDeliveryMethod[storeId] === 'Own Delivery') {
          if (
            storeDetails.freeDeliveryMinimum > storeTotal ||
            !storeDetails.freeDelivery
          ) {
            amount += storeDetails.ownDeliveryServiceFee;
          }
        }

        amount += storeTotal;
      });

      return amount;
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

  @action async getMrSpeedyDeliveryPriceEstimate(
    deliveryLocation,
    deliveryAddress,
  ) {
    return await functions
      .httpsCallable('getMrSpeedyDeliveryPriceEstimate')({
        deliveryLocation,
        deliveryAddress,
      })
      .then((response) => {
        if (response.data.s === 200) {
          console.log(response);
          this.storeMrSpeedyDeliveryFee = response.data.d;

          return;
        }

        return Toast({text: response.data.m, type: 'danger'});
      })
      .catch((err) => console.log(err));
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
    storeSelectedDeliveryMethod,
    storeSelectedPaymentMethod,
    storeAssignedMerchantId,
    storeUserEmail,
    processId,
  }) {
    this.cartUpdateTimeout ? clearTimeout(this.cartUpdateTimeout) : null;

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
            processId,
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
    this.itemCategories = [];
  }

  @action getStoreDetails(storeId) {
    const store = this.storeList.find((element) => element.storeId === storeId);

    return store;
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
          this.storeCartItems = documentSnapshot.data();
        }
      });
  }

  @action async addCartItemToStorage(item, storeId) {
    const storeCartItems = this.storeCartItems[storeId];
    const dateNow = firestore.Timestamp.now().toMillis();

    const newItem = {
      ...item,
      quantity: 1,
      createdAt: dateNow,
      updatedAt: dateNow,
    };
    delete newItem.sales;

    if (storeCartItems) {
      const cartItemIndex = storeCartItems.findIndex(
        (storeCartItem) => storeCartItem.itemId === item.itemId,
      );

      if (cartItemIndex >= 0) {
        storeCartItems[cartItemIndex].quantity += 1;
        storeCartItems[cartItemIndex].updatedAt = dateNow;
      } else {
        storeCartItems.push(newItem);
      }
    } else {
      this.storeCartItems[storeId] = [{...newItem}];
    }
  }

  @action async deleteCartItemInStorage(item, storeId) {
    const storeCart = this.storeCartItems[storeId];
    const dateNow = firestore.Timestamp.now().toMillis();

    if (storeCart) {
      const cartItemIndex = storeCart.findIndex(
        (storeCartItem) => storeCartItem.itemId === item.itemId,
      );

      if (cartItemIndex >= 0) {
        storeCart[cartItemIndex].quantity -= 1;
        storeCart[cartItemIndex].updatedAt = dateNow;

        if (storeCart[cartItemIndex].quantity <= 0) {
          storeCart.splice(cartItemIndex, 1);

          delete this.validItemQuantity[item.itemId];

          if (!this.storeCartItems[storeId].length) {
            delete this.storeCartItems[storeId];
          }
        }
      } else {
        Toast({text: 'Error: Item cannot be found in store!', type: 'danger'});
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
      if (this.storeCartItems && Object.keys(this.storeCartItems).length > 0) {
        await userCartCollection
          .doc(userId)
          .update({...this.storeCartItems})
          .catch((err) => {
            crashlytics().recordError(err);
            Toast({text: err.message, type: 'danger'});
          });
      } else {
        await userCartCollection
          .doc(userId)
          .set({})
          .catch((err) => {
            crashlytics().recordError(err);
            Toast({text: err.message, type: 'danger'});
          });
      }
    }
  }

  @action async getStoreList({
    currentLocationGeohash,
    locationCoordinates,
    storeCategory,
    lastVisible,
  }) {
    if (
      currentLocationGeohash &&
      locationCoordinates &&
      storeCategory &&
      lastVisible
    ) {
      return await storesCollection
        .where('devOnly', '==', true)
        .where('vacationMode', '==', false)
        .where('creditThresholdReached', '==', false)
        .where('storeCategory', '==', storeCategory)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .startAfter(lastVisible)
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].storeId = documentSnapshot.id;
          });

          return list;
        })
        .then(async (list) => {
          this.categoryStoreList[
            storeCategory
          ] = await this.sortStoresByDistance(list, locationCoordinates);
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    } else if (currentLocationGeohash && locationCoordinates && storeCategory) {
      return await storesCollection
        .where('devOnly', '==', true)
        .where('vacationMode', '==', false)
        .where('creditThresholdReached', '==', false)
        .where('storeCategory', '==', storeCategory)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].storeId = documentSnapshot.id;
          });

          return list;
        })
        .then(async (list) => {
          this.categoryStoreList[
            storeCategory
          ] = await this.sortStoresByDistance(list, locationCoordinates);
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    } else if (currentLocationGeohash && locationCoordinates && lastVisible) {
      return await storesCollection
        .where('devOnly', '==', true)
        .where('vacationMode', '==', false)
        .where('creditThresholdReached', '==', false)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .startAfter(lastVisible)
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].storeId = documentSnapshot.id;
          });

          return list;
        })
        .then(async (list) => {
          this.storeList = await this.sortStoresByDistance(
            list,
            locationCoordinates,
          );
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});
        });
    } else if (currentLocationGeohash && locationCoordinates) {
      return await storesCollection
        .where('vacationMode', '==', false)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].storeId = documentSnapshot.id;
          });

          return list;
        })
        .then(async (list) => {
          this.storeList = await this.sortStoresByDistance(
            list,
            locationCoordinates,
          );
        })
        .catch((err) => {
          crashlytics().recordError(err);
          console.log(err);
          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  @action async sortStoresByDistance(list, locationCoordinates) {
    const filteredList = await list.filter((element) =>
      geolib.isPointInPolygon(
        {
          latitude: locationCoordinates.latitude,
          longitude: locationCoordinates.longitude,
        },
        [...element.deliveryCoordinates.boundingBox],
      ),
    );

    const listWithDistance = await filteredList.map((store) => {
      const distance = store.storeLocation
        ? geolib.getDistance(
            {
              latitude: locationCoordinates.latitude,
              longitude: locationCoordinates.longitude,
            },
            {
              latitude: store.storeLocation.latitude,
              longitude: store.storeLocation.longitude,
            },
          )
        : null;

      return {...store, distance};
    });

    const sortedList = await listWithDistance.sort((a, b) => {
      return (
        (a.distance === null) - (b.distance === null) ||
        +(a.distance > b.distance) ||
        -(a.distance < b.distance)
      );
    });

    return sortedList;
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
