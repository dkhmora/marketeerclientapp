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

        querySnapshot.forEach((documentSnapshot, index) => {
          list.push(documentSnapshot.data());

          list[index].merchantId = documentSnapshot.id;
        });

        this.shopList = list;
      })
      .catch((err) => console.log(err));
  }
}

export default shopStore;
