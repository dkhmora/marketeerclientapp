import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class shopStore {
  @observable storeCartItems = new Map();
  @observable storeList = [];
  @observable itemCategories = [];
  @observable storeCategoryItems = new Map();

  @action async addCartItem(item, storeName) {
    if (!this.storeCartItems.get(storeName)) {
      this.storeCartItems.set(storeName, []);
    }

    const itemIndex =
      this.storeCartItems.get(storeName).length > 0
        ? this.storeCartItems
            .get(storeName)
            .findIndex((cartItem) => cartItem.name === item.name)
        : -1;

    if (itemIndex >= 0) {
      this.storeCartItems.get(storeName)[itemIndex].quantity += 1;
    } else {
      item.quantity = 1;
      this.storeCartItems.get(storeName).push(item);
    }

    console.log('Map Objects', ...this.storeCartItems.keys());

    console.log('addCartItem', this.storeCartItems.get(storeName));
  }

  @action async removeCartItem(item, storeName) {
    const itemIndex =
      this.storeCartItems.get(storeName).length > 0
        ? this.storeCartItems
            .get(storeName)
            .findIndex((cartItem) => cartItem.name === item.name)
        : -1;

    if (itemIndex >= 0) {
      const selectedItem = this.storeCartItems.get(storeName)[itemIndex];
      const currentItemQuantity = selectedItem.quantity;

      if (currentItemQuantity === 1) {
        this.storeCartItems.get(storeName).remove(selectedItem);
      } else {
        this.storeCartItems.get(storeName)[itemIndex].quantity -= 1;
      }
    }

    if (this.storeCartItems.get(storeName).length <= 0) {
      this.storeCartItems.delete(storeName);
    }

    console.log('removeCartItem', this.storeCartItems.get(storeName));
  }

  @action async getShopList() {
    await firestore()
      .collection('merchants')
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
    await firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .get()
      .then((documentSnapshot) => {
        const itemCategories = documentSnapshot.data().itemCategories.sort();
        const allItems = documentSnapshot.data().items;

        allItems.forEach((element) => {
          element.storeName = storeName;
        });

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
      .then(
        () => console.log(this.categoryItems),
        console.log('store', this.storeCategoryItems.get(storeName)),
      )
      .then(() => console.log('Items successfully set'))
      .catch((err) => console.log(err));
  }
}

export default shopStore;
