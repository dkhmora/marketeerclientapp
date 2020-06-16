import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

class authStore {
  @observable userAuthenticated = false;
  @observable guest = false;
  @observable userName = '';

  @action async signInAnonymously() {
    await auth()
      .signInAnonymously()
      .then(() => {
        console.log('User signed in anonymously');
      })
      .catch((error) => {
        if (error.code === 'auth/operation-not-allowed') {
          console.log('Enable anonymous in your firebase console.');
        }

        console.error(error);
      });
  }

  @action async createUser(name, email, password, phoneNumber, credential) {
    await this.createUserDocuments(name, email, phoneNumber)
      .then(() => console.log('Successfully created user documents'))
      .then(() => this.linkAnonymousUserWithEmail(email, password))
      .then(() => this.linkCurrentUserWithPhoneNumber(credential))
      .then(() => this.checkAuthStatus())
      .catch((err) => {
        this.userAuthenticated = false;
        console.log(err);
      });
  }

  @action async createUserDocuments(name, email, phoneNumber) {
    const userId = await auth().currentUser.uid;

    await firestore().collection('user_carts').doc(userId).set({});
    await firestore().collection('users').doc(userId).set({
      name,
      email,
      phoneNumber,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  @action async linkAnonymousUserWithEmail(email, password) {
    const credential = await firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );

    await await auth()
      .currentUser.linkWithCredential(credential)
      .then(() => console.log('Successfully linked anonymous user with email'))
      .catch((err) => console.log(err));
  }

  @action async linkCurrentUserWithPhoneNumber(credential) {
    await auth()
      .currentUser.linkWithCredential(credential)
      .then(() =>
        console.log('Successfully linked email account with phone number'),
      )
      .catch((err) => console.log(err));
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
      .then(() => console.log('signed out successfully'))
      .then(() => this.checkAuthStatus());
  }

  @action async checkAuthStatus() {
    const user = await auth().currentUser;

    if (user) {
      console.log('User is authenticated');
      this.guest = user.isAnonymous;
      this.userAuthenticated = true;
    } else {
      console.log('User is not authenticated');
      this.userAuthenticated = false;
      this.signInAnonymously();
    }
  }
}

export default authStore;
