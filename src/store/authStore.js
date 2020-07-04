import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import Toast from '../components/Toast';

class authStore {
  @observable userAuthenticated = false;

  @computed get guest() {
    if (auth().currentUser) {
      return auth().currentUser.isAnonymous;
    }
    return false;
  }

  @computed get authenticationButtonText() {
    return this.guest ? 'Log In' : 'Log Out';
  }

  @computed get userEmail() {
    if (auth().currentUser) {
      return auth().currentUser.email;
    }

    return null;
  }

  @computed get userPhoneNumber() {
    if (auth().currentUser) {
      return auth().currentUser.phoneNumber;
    }

    return null;
  }

  @computed get userId() {
    if (auth().currentUser) {
      return auth().currentUser.uid;
    }

    return null;
  }

  @computed get userName() {
    if (auth().currentUser) {
      return auth().currentUser.displayName;
    }

    return null;
  }

  @action async createUser(
    name,
    email,
    password,
    phoneNumber,
    phoneCredential,
    navigation,
  ) {
    await this.linkCurrentUserWithPhoneNumber(phoneCredential)
      .then(() => this.linkCurrentUserWithEmail(email, password))
      .then(() => this.createUserDocuments(name, email, phoneNumber))
      .then(() => console.log('Successfully created user documents'))
      .then(() => this.checkAuthStatus())
      .then(() => {
        Toast({
          text: 'Welcome to Marketeer!',
          duration: 4000,
        });
      })
      .catch((err) => {
        this.userAuthenticated = false;
        if (err.code === 'auth/credential-already-in-use') {
          Toast({
            text:
              'Error: Phone number is already linked to another account, please use another mobile phone number',
            type: 'danger',
            duration: 6000,
          });
        }
        navigation.goBack();

        console.log(err);
      });
  }

  @action async createUserDocuments(name, email, phoneNumber) {
    const userId = await auth().currentUser.uid;

    await firestore()
      .collection('users')
      .doc(userId)
      .set({
        name,
        email,
        phoneNumber,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .then(() => {
        auth().currentUser.updateProfile({displayName: name});
      });
  }

  @action async linkCurrentUserWithEmail(email, password) {
    const emailCredential = await firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );

    await auth()
      .currentUser.linkWithCredential(emailCredential)
      .then(() => console.log('Successfully linked anonymous user with email'));
  }

  @action async linkCurrentUserWithPhoneNumber(phoneCredential) {
    await auth()
      .currentUser.linkWithCredential(phoneCredential)
      .then(() =>
        console.log('Successfully linked email account with phone number'),
      );
  }

  @action async signIn(email, password) {
    await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() =>
        Toast({
          text: 'Signed in successfully',
          duration: 3500,
        }),
      )
      .then(() => {
        this.userAuthenticated = true;
      })
      .catch((err) => {
        if (err.code === 'auth/user-not-found') {
          Toast({
            text:
              'Wrong username or password. Please create an account or try again.',
            type: 'danger',
            duration: 6000,
          });
        }
        console.log(err);
      });
  }

  @action async signOut() {
    await auth()
      .signOut()
      .then(() =>
        Toast({
          text: 'Signed out successfully',
          duration: 3500,
        }),
      )
      .then(() =>
        auth()
          .signInAnonymously()
          .then(() => {
            this.userAuthenticated = true;
          }),
      )
      .catch((err) => console.log(err));
  }

  @action async checkAuthStatus() {
    if (auth().currentUser) {
      console.log('User is authenticated');
      this.userAuthenticated = true;
    } else {
      console.log('signinanonymous');
      await this.signInAnonymously();
    }
  }

  @action async signInAnonymously() {
    await auth()
      .signInAnonymously()
      .then(() => {
        this.userAuthenticated = true;
      })
      .catch((err) => console.log(err));
  }
}

export default authStore;
