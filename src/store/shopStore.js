import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const userCartCollection = firestore().collection('user_carts');
const merchantsCollection = firestore().collection('merchants');
const merchantItemsCollection = firestore().collection('merchant_items');
class shopStore {
  @observable storeCartItems = {};
  @observable storeSelectedShipping = {};
  @observable storeSelectedPaymentMethod = {};
  @observable storeCategories = [];
  @observable storeList = [];
  @observable itemCategories = [];
  @observable storeCategoryItems = new Map();
  @observable unsubscribeToGetCartItems = null;
  @observable cartUpdateTimeout = null;

  @computed get totalCartItemQuantity() {
    let quantity = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map((storeName) => {
        this.storeCartItems[storeName].map((item) => {
          quantity = item.quantity + quantity;
        });
      });
    }

    return quantity;
  }

  @computed get totalCartSubTotal() {
    let amount = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map((storeName) => {
        this.storeCartItems[storeName].map((item) => {
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

  @action async setStoreCategories() {
    await firestore()
      .collection('application')
      .doc('client_config')
      .get()
      .then((document) => {
        if (document.exists) {
          this.storeCategories = document.data().storeCategories;
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

  @action async placeOrder(orderDetails, orderItems) {
    const userOrdersRef = firestore().collection('orders');
    const orderItemsRef = firestore().collection('order_items');
    const batch = firestore().batch();
    const id = userOrdersRef.doc().id;

    batch.set(orderItemsRef.doc(id), {items: orderItems});
    batch.set(userOrdersRef.doc(id), {...orderDetails});

    return batch.commit();
  }

  @action async deleteCartStore(storeName, userId) {
    firestore()
      .collection('user_carts')
      .doc(userId)
      .update({[storeName]: firestore.FieldValue.delete()})
      .then(() => console.log(`Successfully deleted ${storeName} in cart!`));
  }

  @action resetData() {
    this.storeCartItems = {};
    this.storeSelectedShipping = {};
    this.itemCategories = [];
  }

  @action getStoreDetails(storeName) {
    const store = this.storeList.find(
      (element) => element.storeName === storeName,
    );

    return store;
  }

  @action getCartItemQuantity(item, storeName) {
    if (this.storeCartItems) {
      if (this.storeCartItems[storeName]) {
        const cartItem = this.storeCartItems[storeName].find(
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
        } else {
          this.resetData();
          return;
        }
      });
  }

  @action async addCartItemToStorage(item, storeName) {
    const storeCartItems = this.storeCartItems[storeName];
    const dateNow = new Date().toISOString();

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

      this.storeCartItems[storeName] = [{...newItem}];
    }
  }

  @action async deleteCartItemInStorage(item, storeName) {
    const storeCart = this.storeCartItems[storeName];
    const dateNow = new Date().toISOString();

    if (storeCart) {
      const cartItemIndex = storeCart.findIndex(
        (storeCartItem) => storeCartItem.name === item.name,
      );

      if (cartItemIndex >= 0) {
        storeCart[cartItemIndex].quantity -= 1;
        storeCart[cartItemIndex].updatedAt = dateNow;

        if (storeCart[cartItemIndex].quantity <= 0) {
          storeCart.splice(cartItemIndex, 1);

          if (!this.storeCartItems[storeName].length) {
            delete this.storeCartItems[storeName];
          }
        }
      } else {
        console.log('item cannot be found in store!');
      }
    }
  }

  @action async updateCartItems() {
    const userId = auth().currentUser.uid;

    console.log(this.storeCartItems);

    await userCartCollection
      .doc(userId)
      .update({...this.storeCartItems})
      .catch((err) => console.log(err));
  }

  @action async getShopList() {
    await merchantsCollection
      .where('visibleToPublic', '==', true)
      .where('vacationMode', '==', false)
      .limit(10)
      .get()
      .then((querySnapshot) => {
        const list = [];

        querySnapshot.forEach((documentSnapshot, index) => {
          list.push(documentSnapshot.data());

          list[index].merchantId = documentSnapshot.id;
        });

        this.storeList = list;
      })
      .catch((err) => console.log(err));
  }

  @action async setStoreItems(merchantId, storeName) {
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
        this.storeCategoryItems.set(storeName, categoryItems);
      })
      .then(() => console.log('Items successfully set'))
      .catch((err) => console.log(err));
  }
}

export default shopStore;
