import {observable, action, computed} from 'mobx';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import Toast from '../components/Toast';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import {signInWithPhoneAndPassword} from '../util/firebase-functions';

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
    if (auth().currentUser && auth().currentUser.phoneNumber) {
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
        return await messaging()
          .getToken()
          .then((token) => {
            firestore()
              .collection('users')
              .doc(this.userId)
              .update('fcmTokens', firestore.FieldValue.arrayUnion(token));
          })
          .catch((err) => {
            crashlytics().recordError(err);
            Toast({text: err.message, type: 'danger'});
          });
      }
    }
  }

  @action async unsubscribeToNotifications() {
    await messaging()
      .deleteToken()
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});

        return null;
      });
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
            text: 'Error: Invalid email. Please try again.',
          });

        err.code === 'auth/user-not-found' &&
          Toast({
            type: 'danger',
            text:
              'Error: The user was not found. Please try again or sign up for an account.',
          });

        crashlytics().recordError(err);
      });
  }

  @action async reloadUser() {
    await auth()
      .currentUser.reload()
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});

        return null;
      });
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
          return Toast({
            text: 'Error: Invalid password. No details have been changed.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/wrong-password') {
          return Toast({
            text: 'Error: Wrong password. Please try again.',
            type: 'danger',
          });
        }

        crashlytics().recordError(err);

        return Toast({text: err.message.message, type: 'danger'});
      });
  }

  @action async updateDisplayName(displayName) {
    const {currentUser} = auth();

    await currentUser.updateProfile({displayName}).catch((err) => {
      crashlytics().recordError(err);
      Toast({text: err.message, type: 'danger'});

      return null;
    });
  }

  @action async updatePhoneNumber(credential) {
    await auth()
      .currentUser.updatePhoneNumber(credential)
      .then(() => {
        Toast({text: 'Successfully updated phone number!'});
      })
      .catch((err) => {
        if (err.code === 'auth/quota-exceeded') {
          return Toast({
            text:
              'Error: Too many phone code requests. Please try again later.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/missing-verification-code') {
          return Toast({
            text: 'Error: Missing verification code. Please try again.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/invalid-verification-code') {
          return Toast({
            text: 'Error: Invalid verification code. Please try again.',
            type: 'danger',
          });
        }

        if (err.code === 'auth/credential-already-in-use') {
          return Toast({
            text:
              'Error: Phone number is already in use. Please try again with a different phone number.',
            type: 'danger',
          });
        }
        crashlytics().recordError(err);

        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async createUser(
    name,
    email,
    password,
    phoneNumber,
    phoneCredential,
    birthdate,
    title,
  ) {
    return await this.linkCurrentUserWithPhoneNumber(phoneCredential)
      .then(async () => await this.linkCurrentUserWithEmail(email, password))
      .then(
        async () =>
          await this.createUserDocuments(
            name,
            email,
            phoneNumber,
            birthdate,
            title,
          ),
      )
      .then(async () => await this.checkAuthStatus())
      .then(async () => {
        await this.subscribeToNotifications();
      })
      .then(() => {
        Toast({
          text: `Welcome to Marketeer, ${name}!`,
          duration: 4000,
        });
      });
  }

  @action async createUserDocuments(
    name,
    email,
    phoneNumber,
    birthdate,
    title,
  ) {
    const userId = await auth().currentUser.uid;
    const gender = title === 'Mr' ? 'Male' : 'Female';

    await firestore()
      .collection('users')
      .doc(userId)
      .set({
        name,
        email,
        phoneNumber,
        birthdate,
        gender,
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

    return await auth().currentUser.linkWithCredential(emailCredential);
  }

  @action async linkCurrentUserWithPhoneNumber(phoneCredential) {
    return await auth().currentUser.linkWithCredential(phoneCredential);
  }

  @action async signIn(userCredential, password) {
    const phoneRegexp = new RegExp(/^(09)\d{9}$/);

    if (phoneRegexp.test(userCredential)) {
      const phoneBody = userCredential.slice(1, 11);
      const phoneNumber = `+63${phoneBody}`;

      return await signInWithPhoneAndPassword({phoneNumber, password}).then(
        (response) => {
          if (response.data.s === 200) {
            auth()
              .signInWithCustomToken(response.data.t)
              .then(async (userCred) => {
                this.userAuthenticated = true;

                this.subscribeToNotifications();

                Toast({
                  text: `Welcome back to Marketeer, ${userCred.user.displayName}!`,
                  duration: 3500,
                });

                const claims = (await userCred.user.getIdTokenResult(true))
                  .claims;
                const role = claims ? claims.role : null;
                let storeIds = null;

                if (claims.storeIds) {
                  Object.entries(claims.storeIds).map(([storeId, roles]) => {
                    storeIds = `${
                      storeIds ? `${storeIds}, ` : null
                    }${storeId}: ${roles.toString()}`;
                  });
                }

                crashlytics().log(
                  `${userCred.user.email} signed in using phone number.`,
                );

                return await Promise.all([
                  crashlytics().setUserId(userCred.user.uid),
                  crashlytics().setAttributes({
                    name: userCred.user.displayName,
                    phoneNumber: userCred.user.phoneNumber,
                    email: userCred.user.email,
                    role,
                    storeIds,
                  }),
                ]);
              });
          } else {
            Toast({
              text: response.data.m,
              type: 'danger',
              duration: 3500,
            });
          }

          return response;
        },
      );
    } else {
      return await auth()
        .signInWithEmailAndPassword(userCredential, password)
        .then(async (userCred) => {
          this.userAuthenticated = true;

          this.subscribeToNotifications();

          Toast({
            text: `Welcome back to Marketeer, ${userCred.user.displayName}!`,
            duration: 3500,
          });

          const claims = (await userCred.user.getIdTokenResult(true)).claims;
          const role = claims ? claims.role : null;
          let storeIds = null;

          crashlytics().log(`${userCred.user.email} signed in using email.`);

          await Promise.all([
            crashlytics().setUserId(userCred.user.uid),
            crashlytics().setAttributes({
              name: userCred.user.displayName,
              phoneNumber: userCred.user.phoneNumber,
              email: userCred.user.email,
              role,
              storeIds,
            }),
          ]);

          return {data: {s: 200}};
        })
        .catch((err) => {
          crashlytics().recordError(err);
          Toast({text: err.message, type: 'danger'});

          return null;
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
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }

  @action async checkAuthStatus() {
    if (auth().currentUser) {
      this.userAuthenticated = true;

      // this.subscribeToNotifications();
    } else {
      return await this.signInAnonymously();
    }
  }

  @action async signInAnonymously() {
    return await auth()
      .signInAnonymously()
      .then(() => {
        this.userAuthenticated = true;
      })
      .catch((err) => {
        crashlytics().recordError(err);
        Toast({text: err.message, type: 'danger'});
      });
  }
}

export default authStore;
