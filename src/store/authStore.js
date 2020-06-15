import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

class authStore {
  @observable userAuthenticated = false;
  @observable userName = '';

  @action async linkPhoneNumberWithEmail(email, password) {
    const credential = await firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );

    await auth()
      .currentUser.linkWithCredential(credential)
      .then((usercred) => {
        const user = usercred.user;

        this.userAuthenticated = true;

        console.log('Account linking success', user);
      })
      .catch((error) => {
        this.userAuthenticated = false;

        console.log('Account linking error', error);
      });
  }

  @action async checkAuthStatus() {
    const user = await auth().currentUser;

    if (user) {
      console.log('User is authenticated');
      this.userAuthenticated = true;
    } else {
      console.log('User is not authenticated');
      this.userAuthenticated = false;
    }
  }

  @action async signIn(email, password) {
    await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => console.log('signed in succesfully'))
      .then(() => this.checkAuthStatus())
      .catch((err) => console.log(err));
  }

  @action async signOut() {
    await auth()
      .signOut()
      .then(() => console.log('signed out successfully'));
  }
}

export default authStore;
