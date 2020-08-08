import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import BackButton from '../components/BackButton';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Toast from '../components/Toast';

@inject('authStore')
@observer
class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userCredential: '',
      password: '',
      userCredentialCheck: false,
      secureTextEntry: true,
      forgotPasswordModal: false,
    };
  }

  handleUserCredentialChange = (userCredential) => {
    const regexp = new RegExp(
      /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$|^(09)\d{9}$/,
    );

    this.setState({userCredential});

    if (regexp.test(userCredential)) {
      this.setState({
        userCredentialCheck: true,
      });
    } else {
      this.setState({
        userCredentialCheck: false,
      });
    }
  };

  handlePasswordChange = (value) => {
    this.setState({
      password: value,
    });
  };

  updateSecureTextEntry = () => {
    this.setState({
      secureTextEntry: !this.state.secureTextEntry,
    });
  };

  handleSignIn() {
    const {userCredential, password} = this.state;
    const {checkout} = this.props.route.params;
    const {navigation} = this.props;

    this.props.generalStore.appReady = false;

    this.props.authStore.signIn(userCredential, password).then(() => {
      this.props.generalStore.appReady = false;

      checkout
        ? navigation
            .dangerouslyGetParent()
            .replace('Set Location', {checkout: true})
        : navigation.dangerouslyGetParent().replace('Home');
    });
  }

  async openLink(url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          dismissButtonStyle: 'close',
          preferredBarTintColor: colors.primary,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'pageSheet',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: colors.primary,
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });
      } else {
        Linking.openURL(url);
      }
    } catch (err) {
      Toast({text: err.message, type: 'danger'});
    }
  }

  openTermsAndConditions() {
    const url = 'https://marketeer.ph/components/pages/termsandconditions';

    this.openLink(url);
  }

  openPrivacyPolicy() {
    const url = 'https://marketeer.ph/components/pages/privacypolicy';

    this.openLink(url);
  }

  render() {
    const {navigation} = this.props;
    const {userCredentialCheck} = this.state;
    const {checkout} = this.props.route.params;
    const titleText = checkout ? 'Login to Checkout' : 'Login';

    return (
      <View style={[styles.container, {paddingTop: 0}]}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <ForgotPasswordModal
          isVisible={this.state.forgotPasswordModal}
          closeModal={() => this.setState({forgotPasswordModal: false})}
        />

        <Animatable.View
          duration={800}
          useNativeDriver
          animation="fadeInUp"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: StatusBar.currentHeight,
          }}>
          <BackButton navigation={navigation} />

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
          <KeyboardAwareScrollView>
            <Text style={styles.text_header}>{titleText}</Text>

            <Text style={styles.text_footer}>Email Address/Phone Number</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="user" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="myemail@gmail.com/09991234567"
                placeholderTextColor={colors.text_secondary}
                maxLength={256}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleUserCredentialChange(value)}
              />

              {this.state.userCredentialCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon name="check-circle" color="#388e3c" size={20} />
                </Animatable.View>
              ) : null}
            </View>

            <Text
              style={[
                styles.text_footer,
                {
                  marginTop: 20,
                },
              ]}>
              Password
            </Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="lock" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.text_secondary}
                maxLength={32}
                secureTextEntry={this.state.secureTextEntry ? true : false}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePasswordChange(value)}
              />

              <TouchableOpacity onPress={this.updateSecureTextEntry}>
                {this.state.secureTextEntry ? (
                  <Icon name="eye" color="grey" size={20} />
                ) : (
                  <Icon name="eye-off" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => this.setState({forgotPasswordModal: true})}>
              <Text style={styles.touchable_text}>Forgot Password?</Text>
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                paddingTop: 30,
                flexWrap: 'wrap',
              }}>
              <Text
                style={{textAlign: 'justify', color: colors.text_secondary}}>
                By using our service, you agree to our
              </Text>

              <TouchableOpacity onPress={() => this.openTermsAndConditions()}>
                <Text style={[styles.touchable_text, {textAlign: 'justify'}]}>
                  {' '}
                  Terms and Conditions{' '}
                </Text>
              </TouchableOpacity>

              <Text
                style={{textAlign: 'justify', color: colors.text_secondary}}>
                and{' '}
              </Text>

              <TouchableOpacity onPress={() => this.openPrivacyPolicy()}>
                <Text style={[styles.touchable_text, {textAlign: 'justify'}]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              onPress={() => this.handleSignIn()}
              title="Login"
              type="outline"
              disabled={!userCredentialCheck}
              containerStyle={{
                marginTop: 40,
              }}
              buttonStyle={{
                height: 50,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: userCredentialCheck ? colors.primary : 'grey',
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingTop: 10,
              }}>
              <Text style={styles.color_textPrivate}>
                Don't have an account? Sign up
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Sign Up', {
                    checkout: checkout ? checkout : false,
                  })
                }>
                <Text style={styles.touchable_text}> here</Text>
              </TouchableOpacity>
            </View>
            {/*
            <SocialIcon
              title="Sign In With Facebook"
              button
              type="facebook"
              style={{marginHorizontal: 0, marginTop: 30}}
            />
            */}
          </KeyboardAwareScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default LoginScreen;
