import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import { Toast } from 'native-base';

@inject('generalStore')
@inject('authStore')
@observer
class PhoneVerificationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      verificationId: null,
    };
  }

  componentDidMount() {
    const {phoneNumber} = this.props.route.params;

    this.signInWithPhoneNumber(phoneNumber);
  }

  async signInWithPhoneNumber(phoneNumber) {
    await auth()
      .verifyPhoneNumber(phoneNumber)
      .on(
        'state_changed',
        (phoneAuthSnapshot) => {
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT:
              Toast.show({
                text: 'Verification Code Sent',
                type: 'success',
                duration: 3000,
                style: {margin: 20, borderRadius: 16},
              });

              this.setState({verificationId: phoneAuthSnapshot.verificationId});

              break;
            case firebase.auth.PhoneAuthState.ERROR:
              Toast.show({
                text: 'Error, something went wrong. Please try again later.',
                type: 'danger',
                duration: 3000,
                style: {margin: 20, borderRadius: 16},
              });

              console.log(
                'Verification error: ' + JSON.stringify(phoneAuthSnapshot),
              );
              break;
          }
        },
        (error) => {
          console.log('Error verifying phone number: ' + error);
        },
      );
  }

  async confirmCode(code) {
    const {navigation} = this.props;
    const {name, email, password, phoneNumber} = this.props.route.params;
    const {verificationId} = this.state;

    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code,
    );

    this.props.authStore.createUser(
      name,
      email,
      password,
      phoneNumber,
      credential,
      navigation,
    );
  }

  render() {
    const {phoneNumber} = this.props.route.params;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.primary} />

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
        <Animatable.View useNativeDriver animation="fadeInUpBig" style={styles.footer}>
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
                <TouchableOpacity>
                  <Text style={styles.touchable_text}>
                    Resend Verification Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animatable.View>
      </View>
    );
  }
}

export default PhoneVerificationScreen;
