import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

class authStore {
  @observable userAuthenticated = false;
  @observable guest = false;
  @observable userName = '';

  @computed get authenticationButtonText() {
    console.log(this.guest, 'sa store');
    return this.guest ? 'Log In' : 'Log Out';
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
      .then(() => {
        this.guest = false;
        this.userAuthenticated = true;
      })
      .catch((err) => console.log(err));
  }

  @action async signOut() {
    await auth()
      .signOut()
      .then(() => console.log('signed out successfully'))
      .then(() =>
        auth()
          .signInAnonymously()
          .then(() => {
            this.guest = true;
            this.userAuthenticated = true;
            console.log('guest to', this.guest);
          }),
      )
      .catch((err) => console.log(err));
  }

  @action async checkAuthStatus() {
    const user = await auth().currentUser;

    if (user) {
      console.log('User is authenticated');
      console.log(user.isAnonymous, 'user.isAnonymous');
      this.guest = user.isAnonymous;
      this.userAuthenticated = true;

      if (!this.guest) {
        auth()
          .signInAnonymously()
          .then(() => {
            this.guest = true;
          })
          .catch((err) => console.log(err));
      }
    } else {
      console.log('User is not authenticated');
      this.userAuthenticated = false;
    }
  }
}

export default authStore;
