import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class shopStore {
  @observable storeList = [];
  @observable allStoreItems = [];
  @observable itemCategories = [];
  @observable categoryItems = new Map();

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

  @action async setStoreItems(merchantId) {
    await firestore()
      .collection('merchant_items')
      .doc(merchantId)
      .get()
      .then((documentSnapshot) => {
        const itemCategories = documentSnapshot.data().itemCategories.sort();
        const allItems = documentSnapshot.data().items;

        this.categoryItems.set('All', allItems);

        itemCategories.map((category) => {
          const items = allItems.filter((item) => item.category === category);

          this.categoryItems.set(category, items);
        });
      })
      .then(() => console.log(this.categoryItems))
      .then(() => console.log('Items successfully set'))
      .catch((err) => console.log(err));
  }
}

export default shopStore;
