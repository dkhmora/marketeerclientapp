import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import Toast from '../components/Toast';
import '@react-native-firebase/functions';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const functions = firebase.app().functions('asia-northeast1');
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

  @computed get noPrefixUserPhoneNumber() {
    if (auth().currentUser) {
      return auth().currentUser.phoneNumber.substr(3, 12);
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

  @action async subscribeToNotifications() {
    let authorizationStatus = null;

    if (!this.guest) {
      if (Platform.OS === 'ios') {
        authorizationStatus = await messaging().requestPermission();
      } else {
        authorizationStatus = true;
      }

      if (authorizationStatus) {
        await messaging()
          .getToken()
          .then((token) => {
            firestore()
              .collection('users')
              .doc(this.userId)
              .update('fcmTokens', firestore.FieldValue.arrayUnion(token));
          })
          .catch((err) => Toast({text: err.message, type: 'danger'}));
      }
    }
  }

  @action async unsubscribeToNotifications() {
    await messaging().deleteToken();
  }

  @action async resetPassword(email) {
    await auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Toast({text: 'Password reset email sent!'});
      })
      .catch((err) => {
        err.code === 'auth/invalid-email' &&
          Toast({
            type: 'danger',
            text: 'Error, invalid email. Please try again.',
          });

        err.code === 'auth/user-not-found' &&
          Toast({
            type: 'danger',
            text:
              'Error, the user was not found. Please try again or sign up for an account.',
          });
      });
  }

  @action async reloadUser() {
    await auth().currentUser.reload();
  }

  @action async updateEmailAddress(email, currentPassword) {
    const {currentUser} = auth();
    const recentCredentials = auth.EmailAuthProvider.credential(
      currentUser.email,
      currentPassword,
    );

    await currentUser
      .reauthenticateWithCredential(recentCredentials)
      .then(() => {
        currentUser.updateEmail(email);
      })
      .then(() => {
        Toast({text: 'Successfully updated contact details!'});
      })
      .catch((err) => {
        if (err.code === 'auth/invalid-password') {
          Toast({
            text: 'Error, invalid password. No details have been changed.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/wrong-password') {
          Toast({
            text: 'Error, wrong password. Please try again.',
            type: 'danger',
          });
        }

        Toast({text: err.message.message, type: 'danger'});
      });
  }

  @action async updateDisplayName(displayName) {
    const {currentUser} = auth();

    await currentUser.updateProfile({displayName});
  }

  @action async updatePhoneNumber(credential) {
    await auth()
      .currentUser.updatePhoneNumber(credential)
      .then(() => {
        Toast({text: 'Successfully updated phone number!'});
      })
      .catch((err) => {
        if (err.code === 'auth/quota-exceeded') {
          Toast({
            text:
              'Error, too many phone code requests. Please try again later.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/missing-verification-code') {
          Toast({
            text: 'Error, missing verification code. Please try again.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/invalid-verification-code') {
          Toast({
            text: 'Error, invalid verification code. Please try again.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/credential-already-in-use') {
          Toast({
            text:
              'Error, phone number is already in use. Please try again with a different phone number.',
            type: 'danger',
          });
        }

        Toast({text: err.message, type: 'danger'});
      });
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
      .then(() => this.checkAuthStatus())
      .then(() => {
        this.subscribeToNotifications();
      })
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

        Toast({text: err.message, type: 'danger'});
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
        updatedAt: firestore.Timestamp.now().toMillis(),
        createdAt: firestore.Timestamp.now().toMillis(),
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

    await auth().currentUser.linkWithCredential(emailCredential);
  }

  @action async linkCurrentUserWithPhoneNumber(phoneCredential) {
    await auth().currentUser.linkWithCredential(phoneCredential);
  }

  @action async signIn(userCredential, password) {
    const phoneRegexp = new RegExp(/^(09)\d{9}$/);

    if (phoneRegexp.test(userCredential)) {
      const phoneBody = userCredential.slice(1, 11);
      const phoneNumber = `+63${phoneBody}`;

      return await functions
        .httpsCallable('signInWithPhoneAndPassword')({
          phone: phoneNumber,
          password,
        })
        .then((response) => {
          auth()
            .signInWithCustomToken(response.data.t)
            .then(() => {
              this.userAuthenticated = true;

              this.subscribeToNotifications();

              Toast({
                text: 'Signed in successfully',
                duration: 3500,
              });
            })
            .catch((err) => {
              Toast({
                text: 'Error, something went wrong. Please try again.',
                duration: 3500,
              });

              Toast({text: err.message, type: 'danger'});
            });
        })
        .catch((err) => {
          Toast({
            text: 'Error, wrong phone number or password. Please try again.',
            duration: 3500,
          });

          Toast({text: err.message, type: 'danger'});
        });
    } else {
      return await auth()
        .signInWithEmailAndPassword(userCredential, password)
        .then(() => {
          this.userAuthenticated = true;

          this.subscribeToNotifications();

          Toast({
            text: 'Signed in successfully',
            duration: 3500,
          });
        })
        .catch((err) => {
          if (err.code === 'auth/user-not-found') {
            Toast({
              text:
                'Wrong email or password. Please create an account or try again.',
              type: 'danger',
              duration: 6000,
            });
          }
          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  @action async signOut() {
    return await auth()
      .signOut()
      .then(() => {
        this.unsubscribeToNotifications();
      })
      .then(() => {
        this.signInAnonymously();
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }

  @action async checkAuthStatus() {
    if (auth().currentUser) {
      this.userAuthenticated = true;
    } else {
      await this.signInAnonymously();
    }
  }

  @action async signInAnonymously() {
    await auth()
      .signInAnonymously()
      .then(() => {
        this.userAuthenticated = true;
      })
      .catch((err) => Toast({text: err.message, type: 'danger'}));
  }
}

export default authStore;
