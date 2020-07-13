import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import Toast from '../components/Toast';

@inject('generalStore')
@inject('shopStore')
@inject('authStore')
@observer
class PhoneVerificationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      verificationId: null,
      loading: true,
    };
  }

  componentDidMount() {
    const {phoneNumber} = this.props.route.params;

    this.signInWithPhoneNumber(phoneNumber, false);
  }

  handleResend() {
    const {phoneNumber} = this.props.route.params;

    this.setState({loading: true});

    this.signInWithPhoneNumber(phoneNumber, true);
  }

  async signInWithPhoneNumber(phoneNumber, forceResend) {
    await auth()
      .verifyPhoneNumber(phoneNumber, forceResend)
      .on(
        'state_changed',
        (phoneAuthSnapshot) => {
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT:
              Toast({
                text: 'Verification Code Sent',
                duration: 3000,
              });

              this.setState({
                verificationId: phoneAuthSnapshot.verificationId,
              });

              break;
            case firebase.auth.PhoneAuthState.ERROR:
              Toast({
                text: 'Error, something went wrong. Please try again later.',
                type: 'danger',
                duration: 6000,
              });

              this.props.navigation.navigate('Auth');

              console.log(
                'Verification error: ' + JSON.stringify(phoneAuthSnapshot),
              );
              break;
          }

          this.setState({
            loading: false,
          });
        },
        (error) => {
          console.log('Error verifying phone number: ' + error);
        },
      );
  }

  async confirmCode(code) {
    const {navigation} = this.props;
    const {
      name,
      email,
      password,
      phoneNumber,
      checkout,
    } = this.props.route.params;
    const {verificationId} = this.state;

    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code,
    );

    if (this.props.authStore.guest) {
      this.props.authStore
        .createUser(name, email, password, phoneNumber, credential, navigation)
        .then(() => {
          this.props.shopStore.getCartItems(this.props.authStore.userId);

          if (checkout) {
            this.props.shopStore
              .setCartItems(this.props.authStore.userId)
              .then(() => {
                navigation.dangerouslyGetParent().navigate('Checkout');
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

                navigation.replace('Home');

                console.log(err);
              });
          } else {
            navigation.dangerouslyGetParent().replace('Home');
          }
        });
    } else {
      this.props.authStore
        .updatePhoneNumber(credential)
        .then(() => navigation.replace('Home'))
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

          navigation.replace('Home');

          console.log(err);
        });
    }
  }

  render() {
    const {phoneNumber} = this.props.route.params;
    const {loading} = this.state;

    return (
      <View style={styles.container}>
        <StatusBar animated backgroundColor={colors.primary} />

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 150,
              width: 200,
              resizeMode: 'center',
            }}
          />
        </View>
        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <View style={{flex: 1}}>
            <View style={{flex: 1, justifyContent: 'flex-start'}}>
              <Text style={styles.text_header}>SMS Verification</Text>
              <Text style={styles.text_subtext}>
                Please enter the SMS Verification Code sent to {phoneNumber}
              </Text>
            </View>
            <View style={{flex: 3}}>
              <OTPInputView
                pinCount={6}
                autoFocusOnLoad
                codeInputFieldStyle={{
                  borderRadius: 24,
                  borderColor: '#666',
                  color: colors.primary,
                }}
                codeInputHighlightStyle={{borderColor: colors.primary}}
                keyboardType="number-pad"
                onCodeFilled={(code) => {
                  this.confirmCode(code);
                }}
                style={{width: '95%', height: 100, alignSelf: 'center'}}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  paddingTop: 10,
                }}>
                <Text styles={styles.text_subtext}>
                  Didn't receive the code?{' '}
                </Text>
                <TouchableOpacity onPress={() => this.handleResend()}>
                  <Text style={styles.touchable_text}>
                    Resend Verification Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animatable.View>

        {loading && (
          <View
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    );
  }
}

export default PhoneVerificationScreen;
