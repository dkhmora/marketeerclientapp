import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';

class shopStore {
  @observable shopList = [];

  @action async getShopList() {
    await firestore()
      .collection('merchants')
      .where('visibleToPublic', '==', true)
      .limit(10)
      .get()
      .then((querySnapshot) => {
        const list = [];
        querySnapshot.forEach((documentSnapshot) => {
          list.push(documentSnapshot.data());
        });

        this.shopList = list;
      })
      .then(() => console.log(this.shopList))
      .catch((err) => console.log(err));
  }
}

export default shopStore;
