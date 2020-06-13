import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Image, Button} from 'react-native-elements';
import OTPInputView from '@twotalltotems/react-native-otp-input';

@inject('generalStore')
@observer
class PhoneVerificationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {iconPrefix} = this.props.generalStore;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#E91E63" />

        <View style={styles.header}>
          <Image
            source={require('../../assets/loginLogo.png')}
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
                Please enter the SMS Verification Code sent to +639172938455
              </Text>
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
            <View style={{flex: 2}}>
              <OTPInputView
                pinCount={6}
                autoFocusOnLoad
                codeInputFieldStyle={{
                  borderRadius: 24,
                  borderColor: '#666',
                  color: '#E91E63',
                }}
                codeInputHighlightStyle={{borderColor: '#E91E63'}}
                keyboardType="number-pad"
                onCodeFilled={(code) => {
                  console.log(`Code is ${code}, you are good to go!`);
                }}
                style={{width: '95%', height: 100, alignSelf: 'center'}}
              />
            </View>
          </View>
        </Animatable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E91E63',
  },
  header: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  footer: {
    flex: Platform.OS === 'ios' ? 5 : 7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#111',
    fontWeight: 'normal',
    fontSize: 30,
    paddingBottom: 20,
  },
  text_subtext: {
    color: '#333',
    textAlign: 'left',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  touchable_text: {
    fontWeight: 'bold',
    color: '#E91E63',
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#E91E63',
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
});

export default PhoneVerificationScreen;
