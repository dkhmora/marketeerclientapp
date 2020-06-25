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
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import BackButton from '../components/BackButton';
@inject('generalStore')
@inject('authStore')
@observer
class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      passwordCheck: false,
      confirmPasswordCheck: false,
      confirmPassword: '',
      nameCheck: false,
      emailCheck: false,
      phoneCheck: false,
      secureTextEntry: true,
      confirm_secureTextEntry: true,
      signUpButton_disabled: true,
    };
  }

  handleNameChange = (name) => {
    let formattedName = _.startCase(_.toLower(name));

    this.setState({name: formattedName});

    if (name.length !== 0) {
      this.setState({
        nameCheck: true,
      });
    } else {
      this.setState({
        nameCheck: false,
      });
    }
  };

  handleEmailChange = (email) => {
    const regexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/,
    );

    this.setState({email});

    if (email.length !== 0 && regexp.test(email)) {
      this.setState({
        emailCheck: true,
      });
    } else {
      this.setState({
        emailCheck: false,
      });
    }
  };

  handlePhoneChange = (phoneBody) => {
    const phoneNumber = `+63${phoneBody}`;
    const regexp = new RegExp(/^(\+639)\d{9}$/);

    this.setState({phoneNumber});

    if (phoneNumber.length !== 0 && regexp.test(phoneNumber)) {
      this.setState({
        phoneCheck: true,
      });
    } else {
      this.setState({
        phoneCheck: false,
      });
    }
  };

  handlePasswordChange = (password) => {
    this.setState({password});

    if (password.length >= 6) {
      this.setState({
        passwordCheck: true,
      });
    } else {
      this.setState({
        passwordCheck: false,
      });
    }
  };

  handleConfirmPasswordChange = (confirmPassword) => {
    const {password, passwordCheck} = this.state;

    this.setState({
      confirmPassword,
    });

    if (confirmPassword === password && passwordCheck) {
      this.setState({
        confirmPasswordCheck: true,
      });
    } else {
      this.setState({
        confirmPasswordCheck: false,
      });
    }
  };

  updateSecureTextEntry = () => {
    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
    });
  };

  updateConfirmSecureTextEntry = () => {
    this.setState({
      confirm_secureTextEntry: !this.state.confirm_secureTextEntry,
    });
  };

  handleSignUp() {
    const {name, email, password, phoneNumber} = this.state;
    const {checkout} = this.props.route.params;

    this.props.navigation.navigate('Phone Verification', {
      name,
      email,
      password,
      phoneNumber,
      checkout,
    });
  }

  render() {
    const {
      signUpButton_disabled,
      passwordCheck,
      confirmPasswordCheck,
      name,
      nameCheck,
      emailCheck,
      phoneCheck,
      secureTextEntry,
      confirm_secureTextEntry,
    } = this.state;
    const {checkout} = this.props.route.params;
    const {navigation} = this.props;

    return (
      <View style={[styles.container, {paddingTop: 0}]}>
        <StatusBar animated translucent backgroundColor={colors.primary} />

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 150,
              width: 200,
              resizeMode: 'center',
            }}
          />

          <BackButton navigation={navigation} />
        </View>

        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <ScrollView>
            <Text style={styles.text_header}>Sign Up</Text>

            <Text style={[styles.text_subtext]}>
              Enjoy the convenience of goods delivered right to your doorstep
              while also supporting your local businesses!
            </Text>

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                paddingVertical: 20,
              }}>
              <Text style={styles.text_subtext}>
                Are you a merchant? Come and join us! Register
              </Text>

              <TouchableOpacity>
                <Text style={styles.touchable_text}> here</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.text_footer}>Full Name</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="user" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Gordon Norman"
                maxLength={100}
                style={styles.textInput}
                autoCapitalize="words"
                onChangeText={(value) => this.handleNameChange(value)}
              />

              {nameCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginRight: 25}}
                  />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Email Address</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="mail" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="gordon_norman@gmail.com"
                maxLength={256}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleEmailChange(value)}
              />

              {emailCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginRight: 25}}
                  />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Phone Number</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="smartphone" color={colors.primary} size={20} />

                <Text
                  style={[
                    styles.text_subtext,
                    {marginLeft: 5, marginRight: -5},
                  ]}>
                  (+63)
                </Text>
              </View>

              <TextInput
                placeholder="9173456789"
                keyboardType="numeric"
                maxLength={10}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePhoneChange(value)}
              />

              {phoneCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginRight: 25}}
                  />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Password</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="lock" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Password"
                secureTextEntry={secureTextEntry ? true : false}
                maxLength={32}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePasswordChange(value)}
              />

              {passwordCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginRight: 5}}
                  />
                </Animatable.View>
              ) : null}

              <TouchableOpacity onPress={this.updateSecureTextEntry}>
                {secureTextEntry ? (
                  <Icon name="eye" color="grey" size={20} />
                ) : (
                  <Icon name="eye-off" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.text_footer}>Confirm Password</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="lock" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={confirm_secureTextEntry ? true : false}
                maxLength={32}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) =>
                  this.handleConfirmPasswordChange(value)
                }
              />

              {confirmPasswordCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginRight: 5}}
                  />
                </Animatable.View>
              ) : null}

              <TouchableOpacity onPress={this.updateConfirmSecureTextEntry}>
                {confirm_secureTextEntry ? (
                  <Icon name="eye" color="grey" size={20} />
                ) : (
                  <Icon name="eye-off" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.textPrivate}>
              <Text style={[styles.color_textPrivate, styles.text_subtext]}>
                By signing up you agree to our{' '}
              </Text>

              <TouchableOpacity>
                <Text style={styles.touchable_text}>Terms of service</Text>
              </TouchableOpacity>

              <Text style={[styles.color_textPrivate, styles.text_subtext]}>
                {' '}
                and{' '}
              </Text>

              <TouchableOpacity>
                <Text style={styles.touchable_text}>Privacy policy</Text>
              </TouchableOpacity>
            </View>

            <Button
              onPress={() => this.handleSignUp()}
              disabled={
                !(
                  nameCheck &&
                  emailCheck &&
                  phoneCheck &&
                  passwordCheck &&
                  confirmPasswordCheck
                )
              }
              title="Sign Up"
              type="outline"
              containerStyle={{
                borderRadius: 24,
                borderWidth: 1,
                marginTop: 40,
                height: 50,
                borderColor: emailCheck ? colors.primary : 'grey',
              }}
              buttonStyle={{height: 50}}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingTop: 10,
                paddingBottom: 30,
              }}>
              <Text style={styles.text_subtext}>
                Already have an account? You can login{' '}
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.touchable_text}>here</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default SignUpScreen;
