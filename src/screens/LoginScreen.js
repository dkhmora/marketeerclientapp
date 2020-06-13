import React, {Component} from 'react';
import {
  Text,
  Input,
  Icon,
  Button,
  Card,
  SocialIcon,
  Image,
} from 'react-native-elements';
import {View, StyleSheet} from 'react-native';
import {observer, inject} from 'mobx-react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Container} from 'native-base';

@inject('generalStore')
@observer
class LoginScreen extends Component {
  render() {
    const {iconPrefix} = this.props.generalStore;

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        style={{backgroundColor: '#E91E63'}}>
        <Container style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/loginLogo.png')}
              style={{width: 200, height: 150, resizeMode: 'center'}}
            />
            <Text style={{fontSize: 16, color: '#fff'}}>Welcome!</Text>
          </View>
          <Card containerStyle={styles.footer}>
            <View>
              <View style={styles.formContainer}>
                <Input
                  placeholder="Email Address"
                  inputContainerStyle={styles.inputContainer}
                  leftIcon={
                    <Icon
                      name={`${iconPrefix}-mail`}
                      type="ionicon"
                      size={24}
                      color="#E91E63"
                      style={{marginLeft: 10}}
                    />
                  }
                />
                <Input
                  placeholder="Password"
                  secureTextEntry={true}
                  inputContainerStyle={styles.inputContainer}
                  leftIcon={
                    <Icon
                      name={`${iconPrefix}-key`}
                      type="ionicon"
                      size={24}
                      color="#E91E63"
                      style={{marginLeft: 10}}
                    />
                  }
                />
              </View>
              <Button
                title="Login"
                buttonStyle={styles.loginButton}
                containerStyle={styles.buttonContainer}
              />
              <Text style={styles.centerText}>Or</Text>
              <SocialIcon
                title="Sign In With Facebook"
                button
                type="facebook"
              />
            </View>
            <View style={styles.signUpContainer}>
              <Text style={styles.centerText}>New to Marketeer?</Text>
              <Button
                title="Sign Up"
                type="outline"
                titleStyle={styles.signUpButtonTitleStyle}
                buttonStyle={styles.signUpButton}
                containerStyle={styles.buttonContainer}
              />
            </View>
          </Card>
        </Container>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E91E63',
  },
  header: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  footer: {
    flex: 2,
    backgroundColor: '#ffff',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    margin: 0,
    elevation: 20,
    borderRadius: 30,
    paddingTop: 50,
    paddingBottom: 300,
    marginBottom: -300,
    paddingHorizontal: 30,
  },
  signUpContainer: {bottom: 0},
  formContainer: {marginBottom: 15},
  inputContainer: {
    borderRadius: 24,
    borderColor: '#E91E63',
    borderWidth: 1,
  },
  buttonContainer: {
    alignSelf: 'stretch',
    marginHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#E91E63',
    borderRadius: 24,
    height: 50,
  },
  signUpButton: {
    borderColor: '#E91E63',
    borderRadius: 24,
    borderWidth: 1,
    height: 50,
  },
  signUpButtonTitleStyle: {
    color: '#E91E63',
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default LoginScreen;
