import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class authStore {
  @action async signIn(email, password) {
    await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => console.log('signed in succesfully'))
      .catch((err) => console.log(err));
  }

  @action async signOut() {
    await auth()
      .signOut()
      .then(() => console.log('signed out successfully'));
  }
}

export default authStore;
