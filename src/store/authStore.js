import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

class authStore {
  @action async linkPhoneNumberWithEmail(email, password) {
    const credential = await firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );
    console.log(credential);
    console.log('umabot');

    await auth()
      .currentUser.linkWithCredential(credential)
      .then((usercred) => {
        var user = usercred.user;
        console.log('Account linking success', user);
      })
      .catch((error) => {
        console.log('Account linking error', error);
      });
  }

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
