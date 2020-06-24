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
import {styles} from '../../assets/styles';
import Animated from 'react-native-reanimated';
import BackButton from '../components/BackButton';

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

    this.props.authStore.signIn(email, password, this.props.navigation);
  }

  render() {
    const {navigation} = this.props;
    const {emailCheck} = this.state;
    const {checkout} = this.props.route.params;
    const titleText = checkout ? 'Login to Checkout' : 'Login';

    return (
      <View style={[styles.container, {paddingTop: 0}]}>
        <StatusBar animated translucent backgroundColor="rgba(0, 0, 0, 0.10)" />

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

            <Text style={styles.text_footer}>Email Address</Text>

            <View style={styles.action}>
              <View style={styles.icon_container}>
                <Icon name="user" color={colors.primary} size={20} />
              </View>

              <TextInput
                placeholder="myemail@gmail.com"
                maxLength={256}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(value) => this.handleEmailChange(value)}
              />

              {this.state.emailCheck ? (
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
              disabled={!emailCheck}
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
