import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {Toast} from 'native-base';

class authStore {
  @observable userAuthenticated = false;
  @observable guest = false;
  @observable userName = '';

  @computed get authenticationButtonText() {
    return this.guest ? 'Log In' : 'Log Out';
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
      .then(() => navigation.navigate('Home'))
      .then(() => {
        Toast.show({
          text: 'Welcome to Marketeer!',
          type: 'success',
          duration: 4000,
          style: {margin: 20, borderRadius: 16},
        });
      })
      .catch((err) => {
        this.userAuthenticated = false;
        if (err.code === 'auth/credential-already-in-use') {
          Toast.show({
            text:
              'Error: Phone number is already linked to another account, please use another mobile phone number',
            type: 'danger',
            duration: 6000,
            style: {margin: 20, borderRadius: 16},
          });
        }
        navigation.goBack();

        console.log(err);
      });
  }

  @action async createUserDocuments(name, email, phoneNumber) {
    const userId = await auth().currentUser.uid;

    await firestore().collection('user_carts').doc(userId).set({});
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
    console.log('UID', await auth().currentUser.uid);

    await auth()
      .currentUser.linkWithCredential(phoneCredential)
      .then(() =>
        console.log('Successfully linked email account with phone number'),
      );
  }

  @action async signIn(email, password, navigation) {
    await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => console.log('signed in succesfully'))
      .then(() => {
        this.name = auth().currentUser.displayName;
        this.guest = false;
        this.userAuthenticated = true;
        navigation.dangerouslyGetParent().navigate('Home');
      })
      .catch((err) => {
        if (err.code === 'auth/user-not-found') {
          Toast.show({
            text:
              'Wrong username or password. Please create an account or try again.',
            type: 'danger',
            duration: 6000,
            style: {margin: 20, borderRadius: 16},
          });
        }
        console.log(err);
      });
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
          }),
      )
      .catch((err) => console.log(err));
  }

  @action async checkAuthStatus() {
    const user = await auth().currentUser;

    if (user) {
      console.log('User is authenticated');
      console.log(user);
      this.userName = auth().currentUser.displayName;
      this.guest = user.isAnonymous;
      this.userAuthenticated = true;
    } else if (!this.userAuthenticated) {
      auth()
        .signInAnonymously()
        .then(() => {
          this.guest = true;
          this.userAuthenticated = true;
        })
        .catch((err) => console.log(err));
    } else {
      console.log('User is not authenticated');
      this.userAuthenticated = false;
    }
  }
}

export default authStore;
