import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/functions';
import Toast from '../components/Toast';
import * as geolib from 'geolib';

const functions = firebase.app().functions('asia-northeast1');

const userCartCollection = firestore().collection('user_carts');
const merchantsCollection = firestore().collection('merchants');
const merchantItemsCollection = firestore().collection('merchant_items');
class shopStore {
  @observable storeCartItems = {};
  @observable storeSelectedShipping = {};
  @observable storeSelectedPaymentMethod = {};
  @observable storeCategories = [];
  @observable storeList = [];
  @observable categoryStoreList = {};
  @observable itemCategories = [];
  @observable storeCategoryItems = new Map();
  @observable unsubscribeToGetCartItems = null;
  @observable cartUpdateTimeout = null;
  @observable storeFetchLimit = 8;

  @computed get totalCartItemQuantity() {
    let quantity = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map((merchantId) => {
        this.storeCartItems[merchantId].map((item) => {
          quantity = item.quantity + quantity;
        });
      });
    }

    return quantity;
  }

  @computed get totalCartSubTotal() {
    let amount = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map((merchantId) => {
        this.storeCartItems[merchantId].map((item) => {
          const itemTotal = item.quantity * item.price;

          amount = itemTotal + amount;
        });
      });
    }

    return amount;
  }

  @computed get cartStores() {
    if (this.storeCartItems) {
      const stores = [...Object.keys(this.storeCartItems)];

      return stores;
    }
    return [];
  }

  @action async getStoreDetailsFromMerchantId(merchantId) {
    const storeDetails = await firestore()
      .collection('merchants')
      .doc(merchantId)
      .get()
      .then((document) => {
        if (document.exists) {
          return document.data();
        }
      });

    return storeDetails;
  }

  @action async setStoreCategories() {
    await firestore()
      .collection('application')
      .doc('client_config')
      .get()
      .then((document) => {
        if (document.exists) {
          this.storeCategories = document
            .data()
            .storeCategories.sort((a, b) => a.name > b.name);
        }
      })
      .catch((err) => console.log(err));
  }

  @action async setCartItems(userId) {
    firestore()
      .collection('user_carts')
      .doc(userId)
      .set({
        ...this.storeCartItems,
      })
      .then(() => {
        console.log('Successfully updated cart!');
      });
  }

  @action async placeOrder({
    deliveryCoordinates,
    deliveryAddress,
    userCoordinates,
    userName,
    userPhoneNumber,
    userId,
    storeCartItems,
    storeSelectedShipping,
    storeSelectedPaymentMethod,
  }) {
    this.cartUpdateTimeout ? clearTimeout(this.cartUpdateTimeout) : null;

    return await functions.httpsCallable('placeOrder')({
      orderInfo: JSON.stringify({
        deliveryCoordinates,
        deliveryAddress,
        userCoordinates,
        userName,
        userPhoneNumber,
        userId,
        storeCartItems,
        storeSelectedShipping,
        storeSelectedPaymentMethod,
      }),
    });
  }

  @action resetData() {
    this.storeCartItems = {};
    this.storeSelectedShipping = {};
    this.itemCategories = [];
  }

  @action getStoreDetails(merchantId) {
    const store = this.storeList.find(
      (element) => element.merchantId === merchantId,
    );

    return store;
  }

  @action getCartItemQuantity(item, merchantId) {
    if (this.storeCartItems) {
      if (this.storeCartItems[merchantId]) {
        const cartItem = this.storeCartItems[merchantId].find(
          (storeCartItem) => storeCartItem.name === item.name,
        );

        if (cartItem) {
          return cartItem.quantity;
        }
      }
    }

    return 0;
  }

  @action getCartItems(userId) {
    this.unsubscribeToGetCartItems = userCartCollection
      .doc(userId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot) {
          this.storeCartItems = documentSnapshot.data();
        }
        /* else {
          this.resetData();
          return;
        } */
      });
  }

  @action async addCartItemToStorage(item, merchantId) {
    const storeCartItems = this.storeCartItems[merchantId];
    const dateNow = firestore.Timestamp.now().toMillis();

    const newItem = {
      ...item,
      quantity: 1,
      createdAt: dateNow,
      updatedAt: dateNow,
    };
    delete newItem.stock;
    delete newItem.sales;

    if (storeCartItems) {
      const cartItemIndex = storeCartItems.findIndex(
        (storeCartItem) => storeCartItem.name === item.name,
      );

      if (cartItemIndex >= 0) {
        storeCartItems[cartItemIndex].quantity += 1;
        storeCartItems[cartItemIndex].updatedAt = dateNow;
      } else {
        console.log('item cannot be found in store! Creating new item.');

        storeCartItems.push(newItem);
      }
    } else {
      console.log('Store not found! Creating new store.');

      this.storeCartItems[merchantId] = [{...newItem}];
    }
  }

  @action async deleteCartItemInStorage(item, merchantId) {
    const storeCart = this.storeCartItems[merchantId];
    const dateNow = firestore.Timestamp.now().toMillis();

    if (storeCart) {
      const cartItemIndex = storeCart.findIndex(
        (storeCartItem) => storeCartItem.name === item.name,
      );

      if (cartItemIndex >= 0) {
        storeCart[cartItemIndex].quantity -= 1;
        storeCart[cartItemIndex].updatedAt = dateNow;

        if (storeCart[cartItemIndex].quantity <= 0) {
          storeCart.splice(cartItemIndex, 1);

          if (!this.storeCartItems[merchantId].length) {
            delete this.storeCartItems[merchantId];
          }
        }
      } else {
        console.log('item cannot be found in store!');
      }
    }
  }

  @action async updateCartItems() {
    const userId = auth().currentUser.uid;

    if (Object.keys(this.storeCartItems).length > 0) {
      await userCartCollection
        .doc(userId)
        .update({...this.storeCartItems})
        .catch((err) => console.log(err));
    } else {
      await userCartCollection
        .doc(userId)
        .set({})
        .catch((err) => console.log(err));
    }
  }

  @action async getStoreList({
    currentLocationGeohash,
    locationCoordinates,
    storeCategory,
    lastVisible,
  }) {
    console.log('whut');
    if (
      currentLocationGeohash &&
      locationCoordinates &&
      storeCategory &&
      lastVisible
    ) {
      return await merchantsCollection
        .where('visibleToPublic', '==', true)
        .where('vacationMode', '==', false)
        .where('creditData.creditThresholdReached', '==', false)
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

            list[index].merchantId = documentSnapshot.id;
          });

          return list;
        })
        .then((list) => {
          const finalList = list.filter((element) =>
            geolib.isPointInPolygon({...locationCoordinates}, [
              ...element.deliveryCoordinates.boundingBox,
            ]),
          );

          this.categoryStoreList[storeCategory] = finalList;
        })
        .catch((err) => console.log(err));
    } else if (currentLocationGeohash && locationCoordinates && storeCategory) {
      return await merchantsCollection
        .where('visibleToPublic', '==', true)
        .where('vacationMode', '==', false)
        .where('creditData.creditThresholdReached', '==', false)
        .where('storeCategory', '==', storeCategory)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].merchantId = documentSnapshot.id;
          });

          return list;
        })
        .then((list) => {
          const finalList = list.filter((element) =>
            geolib.isPointInPolygon({...locationCoordinates}, [
              ...element.deliveryCoordinates.boundingBox,
            ]),
          );

          this.categoryStoreList[storeCategory] = finalList;
        })
        .catch((err) => console.log(err));
    } else if (currentLocationGeohash && locationCoordinates && lastVisible) {
      return await merchantsCollection
        .where('visibleToPublic', '==', true)
        .where('vacationMode', '==', false)
        .where('creditData.creditThresholdReached', '==', false)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .startAfter(lastVisible)
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].merchantId = documentSnapshot.id;
          });

          return list;
        })
        .then((list) => {
          const finalList = list.filter((element) =>
            geolib.isPointInPolygon({...locationCoordinates}, [
              ...element.deliveryCoordinates.boundingBox,
            ]),
          );

          this.storeList = finalList;
        })
        .catch((err) => console.log(err));
    } else {
      console.log('qweqwe');
      return await merchantsCollection
        .where('visibleToPublic', '==', true)
        .where('vacationMode', '==', false)
        .where('creditData.creditThresholdReached', '==', false)
        .where('deliveryCoordinates.lowerRange', '<=', currentLocationGeohash)
        .orderBy('deliveryCoordinates.lowerRange')
        .limit(this.storeFetchLimit)
        .get()
        .then((querySnapshot) => {
          const list = [];

          querySnapshot.forEach((documentSnapshot, index) => {
            list.push(documentSnapshot.data());

            list[index].merchantId = documentSnapshot.id;
          });

          return list;
        })
        .then(async (list) => {
          const filteredList = list.filter((element) =>
            geolib.isPointInPolygon(
              {
                latitude: locationCoordinates.latitude,
                longitude: locationCoordinates.longitude,
              },
              [...element.deliveryCoordinates.boundingBox],
            ),
          );

          const listWithDistance = filteredList.map((store) => {
            const distance = geolib.getDistance(
              {
                latitude: locationCoordinates.latitude,
                longitude: locationCoordinates.longitude,
              },
              {
                latitude: store.deliveryCoordinates.latitude,
                longitude: store.deliveryCoordinates.longitude,
              },
            );

            return {...store, distance};
          });

          const sortedList = listWithDistance.sort(
            (a, b) => a.distance - b.distance,
          );

          console.log('umabot', currentLocationGeohash);

          this.storeList = sortedList;
        })
        .catch((err) => console.log(err));
    }
  }

  @action async setStoreItems(merchantId) {
    await merchantItemsCollection
      .doc(merchantId)
      .get()
      .then((documentSnapshot) => {
        const itemCategories = documentSnapshot.data().itemCategories.sort();
        const allItems = documentSnapshot.data().items;

        return {allItems, itemCategories};
      })
      .then(({allItems, itemCategories}) => {
        const categoryItems = new Map();
        categoryItems.set('All', allItems);

        itemCategories.map((category) => {
          const items = allItems.filter((item) => item.category === category);

          categoryItems.set(category, items);
        });

        return categoryItems;
      })
      .then((categoryItems) => {
        this.storeCategoryItems.set(merchantId, categoryItems);
      })
      .then(() => console.log('Items successfully set'))
      .catch((err) => console.log(err));
  }
}

export default shopStore;
