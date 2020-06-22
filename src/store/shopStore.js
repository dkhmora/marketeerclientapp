import {observable, action, computed} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const userCartCollection = firestore().collection('user_carts');
const merchantsCollection = firestore().collection('merchants');
const merchantItemsCollection = firestore().collection('merchant_items');
class shopStore {
  @observable storeCartItems = {};
  @observable storeList = [];
  @observable itemCategories = [];
  @observable storeCategoryItems = new Map();
  @observable unsubscribeToGetCartItems = null;

  @computed get totalCartItemQuantity() {
    let quantity = 0;

    if (this.storeCartItems) {
      Object.keys(this.storeCartItems).map((storeName) => {
        quantity = this.storeCartItems[storeName].length + quantity;
      });
    }

    return quantity;
  }

  @computed get cartStores() {
    if (this.storeCartItems) {
      const stores = [...Object.keys(this.storeCartItems)];

      return stores;
    }
    return [];
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

  @action getCartItems() {
    const userId = auth().currentUser.uid;

    this.unsubscribeToGetCartItems = userCartCollection
      .doc(userId)
      .onSnapshot((documentSnapshot) => {
        this.storeCartItems = documentSnapshot.data();
      });
  }

  @action async addCartItem(item, storeName, quantity) {
    const userId = auth().currentUser.uid;

    if (this.storeCartItems[storeName]) {
      const cartItemIndex = this.storeCartItems[storeName].findIndex(
        (storeCartItem) => storeCartItem.name === item.name,
      );

      if (cartItemIndex >= 0) {
        const newStoreCartItems = [...this.storeCartItems[storeName]];
        newStoreCartItems[cartItemIndex].quantity = quantity;
        newStoreCartItems[cartItemIndex].updatedAt = new Date().toISOString();

        await userCartCollection
          .doc(userId)
          .update({[storeName]: newStoreCartItems})
          .catch((err) => console.log(err));
      } else {
        console.log('item cannot be found in store! Creating new item.');

        const newItem = {...item};
        newItem.quantity = quantity;
        delete newItem.stock;
        delete newItem.sales;
        newItem.createdAt = new Date().toISOString();
        newItem.updatedAt = new Date().toISOString();

        await userCartCollection
          .doc(userId)
          .update(storeName, firestore.FieldValue.arrayUnion(newItem))
          .catch((err) => console.log(err));
      }
    } else {
      const newItem = {...item};
      newItem.quantity = quantity;
      delete newItem.stock;
      delete newItem.sales;
      newItem.createdAt = new Date().toISOString();
      newItem.updatedAt = new Date().toISOString();

      await userCartCollection
        .doc(userId)
        .update({[storeName]: firestore.FieldValue.arrayUnion(newItem)})
        .catch((err) => console.log(err));
    }
  }

  @action async removeCartItem(item, storeName, quantity) {
    const userId = auth().currentUser.uid;
    const storeCart = this.storeCartItems[storeName];

    if (storeCart) {
      const cartItemIndex = storeCart.findIndex(
        (storeCartItem) => storeCartItem.name === item.name,
      );

      if (cartItemIndex >= 0) {
        const storeCartItem = storeCart[cartItemIndex];

        if (quantity <= 0) {
          await userCartCollection
            .doc(userId)
            .update({
              [storeName]: firestore.FieldValue.arrayRemove(storeCartItem),
            })
            .then(() => {
              if (!this.storeCartItems[storeName].length) {
                userCartCollection
                  .doc(userId)
                  .update({[storeName]: firestore.FieldValue.delete()});
              }
            })
            .catch((err) => console.log(err));
        } else {
          const newStoreCartItems = [...storeCart];
          newStoreCartItems[cartItemIndex].quantity = quantity;
          newStoreCartItems[cartItemIndex].updatedAt = new Date().toISOString();

          await userCartCollection
            .doc(userId)
            .update({[storeName]: newStoreCartItems})
            .catch((err) => console.log(err));
        }
      } else {
        console.log('item cannot be found in store!');
      }
    }
  }

  @action async getShopList() {
    await merchantsCollection
      .where('visibleToPublic', '==', true)
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
