import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon} from 'react-native-elements';
@inject('generalStore')
@observer
class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      confirm_password: '',
      check_textInputChange: false,
      secureTextEntry: true,
      confirm_secureTextEntry: true,
    };
  }

  textInputChange = (val) => {
    if (val.length !== 0) {
      this.setState({
        username: val,
        check_textInputChange: true,
      });
    } else {
      this.setState({
        username: val,
        check_textInputChange: false,
      });
    }
  };

  handlePasswordChange = (val) => {
    this.setState({
      password: val,
    });
  };

  handleConfirmPasswordChange = (val) => {
    this.setState({
      confirm_password: val,
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

  render() {
    const {iconPrefix} = this.props.generalStore;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#E91E63" />

        <View style={styles.header}>
          <Text style={styles.text_header}>Register Now!</Text>
        </View>
        <Animatable.View animation="fadeInUpBig" style={styles.footer}>
          <ScrollView>
            <Text style={styles.text_footer}>Username</Text>
            <View style={styles.action}>
              <Icon name="person-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Your Username"
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(val) => this.textInputChange(val)}
              />
              {this.state.check_textInputChange ? (
                <Animatable.View animation="bounceIn">
                  <Icon name="check-circle" color="green" size={20} />
                </Animatable.View>
              ) : null}
            </View>

            <Text
              style={[
                styles.text_footer,
                {
                  marginTop: 35,
                },
              ]}>
              Password
            </Text>
            <View style={styles.action}>
              <Icon name="lock-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Your Password"
                secureTextEntry={this.state.secureTextEntry ? true : false}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(val) => this.handlePasswordChange(val)}
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

            <Text
              style={[
                styles.text_footer,
                {
                  marginTop: 35,
                },
              ]}>
              Confirm Password
            </Text>
            <View style={styles.action}>
              <Icon name="lock-outline" color="#E91E63" size={20} />
              <TextInput
                placeholder="Confirm Your Password"
                secureTextEntry={
                  this.state.confirm_secureTextEntry ? true : false
                }
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={(val) => this.handleConfirmPasswordChange(val)}
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
              <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>
                Terms of service
              </Text>
              <Text style={styles.color_textPrivate}> and </Text>
              <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>
                Privacy policy
              </Text>
            </View>
            <View style={styles.button}>
              <TouchableOpacity style={styles.signIn} onPress={() => {}}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: '#fff',
                    },
                  ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.signIn,
                  {
                    borderRadius: 24,
                    borderColor: '#E91E63',
                    borderWidth: 1,
                    marginTop: 15,
                  },
                ]}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: '#E91E63',
                    },
                  ]}>
                  Sign Up
                </Text>
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
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: Platform.OS === 'ios' ? 3 : 5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#E91E63',
    fontSize: 18,
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
    color: 'grey',
  },
});

export default SignUpScreen;
