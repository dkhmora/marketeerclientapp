import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import BackButton from '../components/BackButton';

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

    this.props.authStore.signIn(userCredential, password).then(() => {
      if (checkout) {
        navigation.dangerouslyGetParent().navigate('Checkout');
      } else {
        navigation.dangerouslyGetParent().replace('Home');
      }
    });
  }

  render() {
    const {navigation} = this.props;
    const {userCredentialCheck} = this.state;
    const {checkout} = this.props.route.params;
    const titleText = checkout ? 'Login to Checkout' : 'Login';

    return (
      <View style={[styles.container, {paddingTop: 0}]}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <Animatable.View
          duration={800}
          useNativeDriver
          animation="fadeInUp"
          style={styles.header}>
          <BackButton navigation={navigation} />

          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 150,
              width: 200,
              resizeMode: 'center',
            }}
          />
        </Animatable.View>

        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <ScrollView>
            <Text style={styles.text_header}>{titleText}</Text>

            <Text style={styles.text_footer}>Email Address/Phone Number</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="user" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="myemail@gmail.com/09991234567"
                maxLength={256}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleUserCredentialChange(value)}
              />

              {this.state.userCredentialCheck ? (
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

            <Button
              onPress={() => this.handleSignIn()}
              title="Login"
              type="outline"
              disabled={!userCredentialCheck}
              containerStyle={{
                borderRadius: 24,
                borderWidth: 1,
                marginTop: 40,
                height: 50,
                borderColor: userCredentialCheck ? colors.primary : 'grey',
              }}
              buttonStyle={{height: 50}}
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

export default LoginScreen;
