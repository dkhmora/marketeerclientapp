import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import Toast from '../components/Toast';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

@inject('generalStore')
@inject('shopStore')
@inject('authStore')
@observer
class PhoneVerificationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      verificationId: null,
      code: '',
    };
  }

  componentDidMount() {
    const {phoneNumber} = this.props.route.params;

    this.props.generalStore.appReady = false;

    this.signInWithPhoneNumber(phoneNumber, false);
  }

  handleResend() {
    const {phoneNumber} = this.props.route.params;

    this.props.generalStore.appReady = false;

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

              Toast({
                text: `Verification error: ${JSON.stringify(
                  phoneAuthSnapshot,
                )}`,
                type: 'danger',
              });
              break;
          }

          this.props.generalStore.appReady = true;
        },
        (error) => {
          Toast({
            text: `Error verifying phone number: ${error.message}`,
            type: 'danger',
          });
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

    this.props.generalStore.appReady = false;

    if (this.props.authStore.guest) {
      this.props.authStore
        .createUser(name, email, password, phoneNumber, credential, navigation)
        .then(() => {
          console.log('jhaha');
          this.props.generalStore.appReady = true;

          if (checkout) {
            console.log('1');
            this.props.shopStore
              .setCartItems(this.props.authStore.userId)
              .then(() => {
                navigation
                  .dangerouslyGetParent()
                  .replace('Set Location', {checkout: true});
              });
          } else {
            console.log('2');
            navigation.dangerouslyGetParent().navigate('Home');
          }
        })
        .catch((err) => {
          this.props.generalStore.appReady = true;

          if (err.code === 'auth/quota-exceeded') {
            navigation.replace('Home');

            Toast({
              text:
                'Error, too many phone code requests. Please try again later.',
              type: 'danger',
            });
          } else if (err.code === 'auth/missing-verification-code') {
            Toast({
              text: 'Error, missing verification code. Please try again.',
              type: 'danger',
            });
          } else if (err.code === 'auth/invalid-verification-code') {
            this.setState({code: ''});

            Toast({
              text: 'Error, invalid verification code. Please try again.',
              type: 'danger',
            });
          } else if (err.code === 'auth/credential-already-in-use') {
            navigation.replace('Sign Up');

            Toast({
              text:
                'Error, phone number is already in use. Please try again with a different phone number.',
              type: 'danger',
            });
          } else {
            Toast({text: err.message, type: 'danger'});
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

          Toast({text: err.message, type: 'danger'});
        });
    }
  }

  render() {
    const {phoneNumber} = this.props.route.params;
    const {code} = this.state;

    return (
      <View style={styles.container}>
        <StatusBar animated backgroundColor={colors.primary} />

        <Animatable.View
          duration={800}
          useNativeDriver
          animation="fadeInUp"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: StatusBar.currentHeight,
          }}>
          <SafeAreaView style={{flexDirection: 'row'}}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{
                height: 150,
                width: 200,
                resizeMode: 'contain',
                marginVertical: 20,
              }}
            />
          </SafeAreaView>
        </Animatable.View>

        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <KeyboardAwareScrollView style={{flex: 1}}>
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
                code={code}
                onCodeChanged={(otpCode) => this.setState({code: otpCode})}
                codeInputFieldStyle={{
                  borderRadius: 24,
                  borderColor: '#666',
                  color: colors.primary,
                }}
                codeInputHighlightStyle={{borderColor: colors.primary}}
                keyboardType="number-pad"
                onCodeFilled={(fullCode) => {
                  this.confirmCode(fullCode);
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
          </KeyboardAwareScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default PhoneVerificationScreen;
