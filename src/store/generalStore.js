import {observable, action} from 'mobx';
import {Platform} from 'react-native';
import storage from '@react-native-firebase/storage';

class generalStore {
  @action async getImageURI(imageRef) {
    if (imageRef) {
      const ref = storage().ref(imageRef);
      const link = await ref.getDownloadURL();
      console.log(link);
      return link;
    }
    return 0;
  }
}

export default generalStore;
