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
@inject('generalStore')
@inject('authStore')
@observer
class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      emailCheck: false,
      phoneCheck: false,
      secureTextEntry: true,
      confirm_secureTextEntry: true,
    };
  }

  handleEmailChange = (value) => {
    if (value.length !== 0) {
      this.setState({
        email: value,
        emailCheck: true,
      });
    } else {
      this.setState({
        email: value,
        emailCheck: false,
      });
    }
  };

  handlePhoneChange = (value) => {
    if (value.length !== 0) {
      this.setState({
        phoneNumber: value,
        phoneCheck: true,
      });
    } else {
      this.setState({
        phoneNumber: value,
        phoneCheck: false,
      });
    }
  };

  handlePasswordChange = (value) => {
    this.setState({
      password: value,
    });
  };

  handleConfirmPasswordChange = (value) => {
    this.setState({
      confirmPassword: value,
    });
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
    const {email, password, phoneNumber} = this.state;

    this.props.navigation.navigate('Phone Verification', {
      email,
      password,
      phoneNumber,
    });
  }

  render() {
    const {iconPrefix} = this.props.generalStore;
    const {navigation} = this.props;

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

            <Text style={styles.text_footer}>Email Address</Text>
            <View style={styles.action}>
              <Icon name="person-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Email Address"
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleEmailChange(value)}
              />
              {this.state.emailCheck ? (
                <Animatable.View animation="bounceIn">
                  <Icon name="check-circle" color="green" size={20} />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Phone Number</Text>
            <View style={styles.action}>
              <Icon name="person-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Phone Number"
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePhoneChange(value)}
              />
              {this.state.phoneCheck ? (
                <Animatable.View animation="bounceIn">
                  <Icon name="check-circle" color="green" size={20} />
                </Animatable.View>
              ) : null}
            </View>

            <Text style={styles.text_footer}>Password</Text>
            <View style={styles.action}>
              <Icon name="lock-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Password"
                secureTextEntry={this.state.secureTextEntry ? true : false}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePasswordChange(value)}
              />
              <TouchableOpacity onPress={this.updateSecureTextEntry}>
                {this.state.secureTextEntry ? (
                  <Icon
                    name={`${iconPrefix}-eye`}
                    type="ionicon"
                    color="grey"
                    size={20}
                  />
                ) : (
                  <Icon
                    name={`${iconPrefix}-eye-off`}
                    type="ionicon"
                    color="grey"
                    size={20}
                  />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.text_footer}>Confirm Password</Text>
            <View style={styles.action}>
              <Icon name="lock-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={
                  this.state.confirm_secureTextEntry ? true : false
                }
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) =>
                  this.handleConfirmPasswordChange(value)
                }
              />
              <TouchableOpacity onPress={this.updateConfirmSecureTextEntry}>
                {this.state.secureTextEntry ? (
                  <Icon
                    name={`${iconPrefix}-eye`}
                    type="ionicon"
                    color="grey"
                    size={20}
                  />
                ) : (
                  <Icon
                    name={`${iconPrefix}-eye-off`}
                    type="ionicon"
                    color="grey"
                    size={20}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.textPrivate}>
              <Text style={styles.color_textPrivate}>
                By signing up you agree to our{' '}
              </Text>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.color_textPrivate,
                    {fontWeight: 'bold', color: '#E91E63'},
                  ]}>
                  Terms of service
                </Text>
              </TouchableOpacity>
              <Text style={styles.color_textPrivate}> and </Text>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.color_textPrivate,
                    {fontWeight: 'bold', color: '#E91E63'},
                  ]}>
                  Privacy policy
                </Text>
              </TouchableOpacity>
            </View>
            <Button
              onPress={() => this.handleSignUp()}
              title="Sign Up"
              type="outline"
              containerStyle={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#E91E63',
                marginTop: 40,
                height: 50,
              }}
              buttonStyle={{height: 50}}
              titleStyle={{color: '#E91E63'}}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingVertical: 10,
              }}>
              <Text>Already have an account? You can login </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.touchable_text}>here.</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    paddingTop: 10,
  },
  text_header: {
    color: '#111',
    fontWeight: 'normal',
    fontSize: 30,
    paddingBottom: 20,
    paddingTop: 10,
  },
  text_subtext: {
    color: '#333',
    textAlign: 'left',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  text_footer: {
    color: '#333',
    fontSize: 18,
  },
  touchable_text: {
    fontWeight: 'bold',
    color: '#E91E63',
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
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
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  color_textPrivate: {
    color: '#333',
  },
});

export default SignUpScreen;
