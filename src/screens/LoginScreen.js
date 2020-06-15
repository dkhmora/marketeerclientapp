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
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';

@inject('generalStore')
@inject('authStore')
@observer
class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      emailCheck: false,
      secureTextEntry: true,
    };
  }

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
    const {email, password} = this.state;

    this.props.authStore.signIn(email, password);
  }

  render() {
    const {navigation} = this.props;

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
          <ScrollView>
            <Text style={styles.text_header}>Login</Text>

            <Text style={styles.text_footer}>Email Address</Text>
            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon
                  name="user"
                  type="feather"
                  color={colors.primary}
                  size={20}
                />
              </View>
              <TextInput
                placeholder="myemail@gmail.com"
                maxLength={256}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleEmailChange(value)}
              />
              {this.state.emailCheck ? (
                <Animatable.View animation="bounceIn">
                  <Icon
                    name="check-circle"
                    type="feather"
                    color="#388e3c"
                    size={20}
                    style={{marginRight: 25}}
                  />
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
                <Icon
                  name="lock"
                  type="feather"
                  color={colors.primary}
                  size={20}
                />
              </View>
              <TextInput
                placeholder="Your Password"
                maxLength={32}
                secureTextEntry={this.state.secureTextEntry ? true : false}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handlePasswordChange(value)}
              />
              <TouchableOpacity onPress={this.updateSecureTextEntry}>
                {this.state.secureTextEntry ? (
                  <Icon name="eye" type="feather" color="grey" size={20} />
                ) : (
                  <Icon name="eye-off" type="feather" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <Button
              onPress={() => this.handleSignIn()}
              title="Login"
              type="outline"
              containerStyle={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.primary,
                marginTop: 40,
                height: 50,
              }}
              buttonStyle={{height: 50}}
              titleStyle={{
                color: colors.primary,
                fontFamily: 'ProductSans-Bold',
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingTop: 10,
              }}>
              <Text style={styles.color_textPrivate}>
                Don't have an account? You can sign up{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
                <Text style={styles.touchable_text}>here</Text>
              </TouchableOpacity>
            </View>
            <SocialIcon
              title="Sign In With Facebook"
              button
              type="facebook"
              style={{marginHorizontal: 0, marginTop: 30}}
            />
          </ScrollView>
        </Animatable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
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
    fontFamily: 'ProductSans-Light',
  },
  text_subtext: {
    color: '#333',
    textAlign: 'left',
    fontFamily: 'ProductSans-Light',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  text_footer: {
    fontFamily: 'ProductSans-Light',
    color: '#333',
    fontSize: 18,
  },
  touchable_text: {
    fontFamily: 'ProductSans-Bold',
    color: colors.primary,
    marginTop: 1,
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
    color: colors.primary,
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
  icon_container: {
    flexDirection: 'row',
    marginTop: 2,
  },
});

export default LoginScreen;
