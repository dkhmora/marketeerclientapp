import {observable, action} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

class authStore {
  @observable userAuthenticated = false;
  @observable guest = false;
  @observable userName = '';

  @action async signInAnonymously() {
    this.checkAuthStatus().then(() => {
      if (!this.userAuthenticated) {
        auth()
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
      } else {
        console.log('User is already logged in!');
      }
    });
  }

  @action async createUser(name, email, password) {
    await this.createUserDocuments(name, email, password)
      .then(() => console.log('Successfully created user documents'))
      .then(() => this.linkPhoneNumberWithEmail(name, email, password))
      .then((user) => console.log('Account linking success', user))
      .then(() => (this.userAuthenticated = true))
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

  @action async linkPhoneNumberWithEmail(name, email, password) {
    const credential = await firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );

    await auth()
      .currentUser.linkWithCredential(credential)
      .then((usercred) => {
        const user = usercred.user;

        user.updateProfile({
          displayName: name,
        });

        return user;
      });
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
