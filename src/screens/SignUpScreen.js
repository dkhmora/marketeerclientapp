import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Linking,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {Picker} from 'native-base';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import BackButton from '../components/BackButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Toast from '../components/Toast';
import moment, {ISO_8601} from 'moment';
import crashlytics from '@react-native-firebase/crashlytics';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const SCREEN_WIDTH = Dimensions.get('screen').width;
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
      datePickerVisible: false,
      selectedBirthdate: null,
      selectedDate: null,
      maxDate: moment().subtract(18, 'years').toDate(),
      selectedTitle: 'Mr',
      passwordCheck: false,
      confirmPasswordCheck: false,
      confirmPassword: '',
      nameCheck: false,
      emailCheck: false,
      phoneCheck: false,
      secureTextEntry: true,
      confirm_secureTextEntry: true,
    };
  }

  componentDidMount() {
    crashlytics().log('SignUpScreen');
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
    const {
      name,
      email,
      password,
      phoneNumber,
      selectedBirthdate,
      selectedTitle,
    } = this.state;
    const {checkout} = this.props.route.params;

    this.props.navigation.replace('Phone Verification', {
      name,
      email,
      password,
      phoneNumber,
      checkout,
      selectedBirthdate,
      selectedTitle,
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

  openMerchantSignUpForm() {
    const url = 'https://marketeer.ph/components/pages/partnermerchantsignup';

    this.openLink(url);
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
    const {
      passwordCheck,
      confirmPasswordCheck,
      nameCheck,
      emailCheck,
      phoneCheck,
      secureTextEntry,
      confirm_secureTextEntry,
      maxDate,
      selectedBirthdate,
      selectedTitle,
      datePickerVisible,
      selectedDate,
    } = this.state;
    const {navigation} = this.props;

    return (
      <View style={[styles.container, {paddingTop: 0}]}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="date"
          onConfirm={(newDate) =>
            this.setState({
              datePickerVisible: false,
              selectedDate: newDate,
              selectedBirthdate: moment(newDate, ISO_8601).format('YYYY-MM-DD'),
            })
          }
          onCancel={() => this.setState({datePickerVisible: false})}
          maximumDate={maxDate}
          date={selectedDate ? selectedDate : new Date()}
          locale={'en'}
          timeZoneOffsetInMinutes={undefined}
          modalTransparent={false}
          animationType={'fade'}
          androidMode={'default'}
          placeHolderText="Select Your Birthdate"
          textStyle={{color: colors.primary}}
          disabled={false}
        />

        <View
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
        </View>

        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingTop: 10,
          }}>
          <KeyboardAwareScrollView style={{paddingHorizontal: 20}}>
            <Text style={styles.text_header}>Sign Up</Text>

            <Text style={[styles.text_subtext]}>
              Enjoy the convenience of goods delivered right to your doorstep
              while also supporting your local businesses!
            </Text>

            {Platform.OS === 'android' && (
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  paddingVertical: 20,
                }}>
                <Text style={styles.text_subtext}>
                  Are you a merchant? Come and join us! Register
                </Text>

                <TouchableOpacity onPress={() => this.openMerchantSignUpForm()}>
                  <Text style={styles.touchable_text}> here</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={(styles.text_footer, {paddingTop: 20})}>Title</Text>

            <View style={[styles.action]}>
              <Picker
                textStyle={{
                  fontFamily: 'ProductSans-Bold',
                  color: colors.primary,
                  width: SCREEN_WIDTH - 80,
                }}
                itemTextStyle={{
                  color: colors.primary,
                  fontFamily: 'ProductSans-Light',
                }}
                headerTitleStyle={{
                  fontFamily: 'ProductSans-Light',
                  color: colors.text_primary,
                }}
                mode="dropdown"
                selectedValue={selectedTitle}
                iosIcon={<Icon name="chevron-down" />}
                iosHeader="Select a Title"
                headerBackButtonText="Back"
                headerBackButtonTextStyle={{
                  fontFamily: 'ProductSans-Light',
                  color: colors.primary,
                }}
                itemStyle={{flex: 1}}
                onValueChange={(value) =>
                  this.setState({selectedTitle: value})
                }>
                <Picker.Item label="Mr" value="Mr" />
                <Picker.Item label="Mrs" value="Mrs" />
              </Picker>
            </View>

            <Text style={styles.text_footer}>Full Name</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="user" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Gordon Norman"
                maxLength={100}
                placeholderTextColor={colors.text_secondary}
                style={styles.textInput}
                autoCapitalize="words"
                onChangeText={(value) => this.handleNameChange(value)}
              />

              {nameCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon name="check-circle" color="#388e3c" size={20} />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Birthdate</Text>

            <View
              style={[
                styles.action,
                {
                  flexDirection: 'column',
                },
              ]}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={styles.icon_container}>
                  <Icon name="calendar" color={colors.primary} size={20} />
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginTop: 5,
                      paddingLeft: 10,
                    }}
                    onPress={() => this.setState({datePickerVisible: true})}>
                    {selectedBirthdate ? (
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: 'ProductSans-Bold',
                        }}>
                        {selectedBirthdate}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'ProductSans-Bold',
                          color: colors.text_secondary,
                        }}>
                        Select Date
                      </Text>
                    )}
                  </TouchableOpacity>

                  {selectedBirthdate ? (
                    <Animatable.View useNativeDriver animation="bounceIn">
                      <Icon name="check-circle" color="#388e3c" size={20} />
                    </Animatable.View>
                  ) : null}
                </View>
              </View>

              <View style={{flexDirection: 'row', paddingTop: 15}}>
                <Text style={{color: colors.text_secondary, fontSize: 12}}>
                  You must be atleast{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'ProductSans-Bold',
                    color: colors.text_secondary,
                    fontSize: 12,
                  }}>
                  18 years of age{' '}
                </Text>
                <Text style={{color: colors.text_secondary, fontSize: 12}}>
                  to use Marketeer
                </Text>
              </View>
            </View>

            <Text style={styles.text_footer}>Email Address</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="mail" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="gordon_norman@gmail.com"
                placeholderTextColor={colors.text_secondary}
                maxLength={256}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleEmailChange(value)}
              />

              {emailCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon name="check-circle" color="#388e3c" size={20} />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Phone Number</Text>

            <View style={[styles.action, {flexDirection: 'column'}]}>
              <View style={{flexDirection: 'row'}}>
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
                  placeholderTextColor={colors.text_secondary}
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(value) => this.handlePhoneChange(value)}
                />

                {phoneCheck ? (
                  <Animatable.View useNativeDriver animation="bounceIn">
                    <Icon name="check-circle" color="#388e3c" size={20} />
                  </Animatable.View>
                ) : null}
              </View>

              <Text
                style={{
                  color: colors.text_secondary,
                  fontSize: 12,
                  paddingTop: 15,
                }}>
                We will send you a verification code here. *Standard rates may
                apply
              </Text>
            </View>

            <Text style={styles.text_footer}>Password</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="lock" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.text_secondary}
                secureTextEntry={secureTextEntry ? true : false}
                maxLength={32}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePasswordChange(value)}
              />

              <TouchableOpacity onPress={this.updateSecureTextEntry}>
                {secureTextEntry ? (
                  <Icon name="eye" color="grey" size={20} />
                ) : (
                  <Icon name="eye-off" color="grey" size={20} />
                )}
              </TouchableOpacity>

              {passwordCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginLeft: 5}}
                  />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Confirm Password</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="lock" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={colors.text_secondary}
                secureTextEntry={confirm_secureTextEntry ? true : false}
                maxLength={32}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) =>
                  this.handleConfirmPasswordChange(value)
                }
              />

              <TouchableOpacity onPress={this.updateConfirmSecureTextEntry}>
                {confirm_secureTextEntry ? (
                  <Icon name="eye" color="grey" size={20} />
                ) : (
                  <Icon name="eye-off" color="grey" size={20} />
                )}
              </TouchableOpacity>

              {confirmPasswordCheck ? (
                <Animatable.View useNativeDriver animation="bounceIn">
                  <Icon
                    name="check-circle"
                    color="#388e3c"
                    size={20}
                    style={{marginLeft: 5}}
                  />
                </Animatable.View>
              ) : null}
            </View>

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
                marginTop: 40,
              }}
              buttonStyle={{
                height: 50,
                borderRadius: 24,
                borderWidth: 1,
                borderColor:
                  nameCheck &&
                  emailCheck &&
                  phoneCheck &&
                  passwordCheck &&
                  confirmPasswordCheck &&
                  selectedBirthdate
                    ? colors.primary
                    : 'grey',
              }}
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
          </KeyboardAwareScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default SignUpScreen;
