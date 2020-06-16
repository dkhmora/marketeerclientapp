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
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

@inject('generalStore')
@inject('authStore')
@observer
class PhoneVerificationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      code: null,
      confirm: null,
    };
  }

  componentDidMount() {
    const {phoneNumber} = this.props.route.params;

    this.signInWithPhoneNumber(phoneNumber);
  }

  async signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);

    this.setState({confirm: confirmation});
  }

  async confirmCode(code) {
    const {name, email, password} = this.props.route.params;
    await this.state.confirm
      .confirm(code)
      .then(() => {
        this.props.authStore.createUser(name, email, password);
        console.log('phone success');
      })
      .catch((err) => console.log('unsuccessful phone auth', err));
  }

  render() {
    const {iconPrefix} = this.props.generalStore;
    const {phoneNumber, email, password} = this.props.route.params;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.primary} />

        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={{
              height: 150,
              width: 200,
              resizeMode: 'center',
            }}
          />
        </View>
        <Animatable.View animation="fadeInUpBig" style={styles.footer}>
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
