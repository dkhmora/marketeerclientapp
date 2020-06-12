import React, {Component} from 'react';
import {
  Text,
  Input,
  Icon,
  Button,
  Card,
  SocialIcon,
} from 'react-native-elements';
import {View, StyleSheet, StatusBar} from 'react-native';
import {observer, inject} from 'mobx-react';

@inject('generalStore')
@observer
class LoginScreen extends Component {
  render() {
    const {iconPrefix} = this.props.generalStore;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#E91E63" />

        <View style={styles.header}>
          <Text h3>Marketeer PH</Text>
          <Text h4>Welcome!</Text>
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
            <SocialIcon title="Sign In With Facebook" button type="facebook" />
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
      </View>
    );
  }
}
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E91E63',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 2,
    backgroundColor: '#ffff',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    margin: 0,
    elevation: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 50,
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
