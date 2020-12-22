import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import BackButton from '../components/BackButton';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import Toast from '../components/Toast';
import crashlytics from '@react-native-firebase/crashlytics';
import {ScrollView} from 'react-native-gesture-handler';
import {openLink} from '../util/helpers';
import {privacyPolicyUrl, termsAndConditionsUrl} from '../util/variables';

@inject('authStore')
@inject('generalStore')
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

  componentDidMount() {
    crashlytics().log('LoginScreen');
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

    this.props.authStore
      .signIn(userCredential, password)
      .then((response) => {
        this.props.generalStore.appReady = true;

        if (response.data.s === 200) {
          checkout
            ? navigation
                .dangerouslyGetParent()
                .replace('Set Location', {checkout: true})
            : navigation.dangerouslyGetParent().replace('Home');
        }
      })
      .catch((err) => {
        this.props.generalStore.appReady = true;

        if (
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password'
        ) {
          Toast({
            text:
              'Wrong email or password. Please create an account or try again.',
            type: 'danger',
            duration: 6000,
          });
        } else {
          Toast({
            text: err.message,
            type: 'danger',
            duration: 3500,
          });
        }
      });
  }

  handleOpenLink(url) {
    this.props.generalStore
      .toggleAppLoader()
      .then(() => openLink(url))
      .then(() => this.props.generalStore.toggleAppLoader());
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
          style={{
            flex: 1,
            backgroundColor: colors.icons,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingTop: 10,
          }}>
          <ScrollView style={{paddingHorizontal: 20}}>
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

              <TouchableOpacity
                onPress={() => this.handleOpenLink(termsAndConditionsUrl)}>
                <Text style={[styles.touchable_text, {textAlign: 'justify'}]}>
                  {' Terms and Conditions '}
                </Text>
              </TouchableOpacity>

              <Text
                style={{textAlign: 'justify', color: colors.text_secondary}}>
                {'and '}
              </Text>

              <TouchableOpacity
                onPress={() => this.handleOpenLink(privacyPolicyUrl)}>
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
          </ScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default LoginScreen;
