import React, {Component} from 'react';
import BaseHeader from '../components/BaseHeader';
import {View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Card, CardItem} from 'native-base';
import {Text, Button, Icon, Input, Overlay} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {computed} from 'mobx';
import Toast from '../components/Toast';
import {styles} from '../../assets/styles';

@inject('authStore')
@observer
class AccountScreen extends Component {
  constructor(props) {
    super(props);

    const {userName, userEmail, noPrefixUserPhoneNumber} = this.props.authStore;

    this.state = {
      editMode: false,
      passwordInputModal: false,
      newEmail: userEmail,
      newDisplayName: userName,
      newPhoneNumber: noPrefixUserPhoneNumber,
      currentPassword: '',
    };
  }

  handleSaveAccountDetails() {
    const {userName, userEmail, userPhoneNumber} = this.props.authStore;
    const {navigation} = this.props;
    const {
      newPhoneNumber,
      newDisplayName,
      newEmail,
      currentPassword,
    } = this.state;
    const withPrefixUserPhoneNumber = `+63${newPhoneNumber}`;

    this.setState({passwordInputModal: false, editMode: false});

    if (userName !== newDisplayName) {
      this.props.authStore.updateDisplayName(newDisplayName).then(() => {
        Toast({text: 'Successfully updated contact details!'});
      });
    }

    if (userEmail !== newEmail) {
      return this.props.authStore
        .updateEmailAddress(newEmail, currentPassword)
        .then(() => {
          if (userPhoneNumber !== withPrefixUserPhoneNumber) {
            navigation.navigate('Phone Verification', {
              phoneNumber: withPrefixUserPhoneNumber,
            });
          }
        })
        .catch((err) => {
          if (err.code === 'auth/wrong-password') {
            Toast({
              text: 'Error, wrong password. Please try again.',
              type: 'danger',
            });
          }
        });
    }

    if (userPhoneNumber !== withPrefixUserPhoneNumber) {
      return navigation.navigate('Phone Verification', {
        phoneNumber: withPrefixUserPhoneNumber,
      });
    }
  }

  handleCheckRequirements() {
    const {userName, userEmail, userPhoneNumber} = this.props.authStore;
    const {newPhoneNumber, newDisplayName, newEmail} = this.state;

    const withPrefixUserPhoneNumber = `+63${newPhoneNumber}`;

    if (userEmail !== newEmail) {
      this.setState({passwordInputModal: true});
    } else if (
      userName !== newDisplayName ||
      userPhoneNumber !== withPrefixUserPhoneNumber
    ) {
      this.handleSaveAccountDetails();
    } else {
      Toast({text: 'Nothing was changed'});
      this.setState({editMode: false});
    }
  }

  resetData() {
    const {userName, userEmail, noPrefixUserPhoneNumber} = this.props.authStore;

    this.setState({
      passwordInputModal: false,
      editMode: false,
      newEmail: userEmail,
      newDisplayName: userName,
      newPhoneNumber: noPrefixUserPhoneNumber,
      currentPassword: '',
    });
  }

  render() {
    const {navigation} = this.props;
    const {userName, userEmail, userPhoneNumber} = this.props.authStore;
    const {
      editMode,
      newDisplayName,
      newEmail,
      newPhoneNumber,
      passwordInputModal,
      currentPassword,
    } = this.state;

    return (
      <View style={{flex: 1}}>
        <BaseHeader title={userName} backButton navigation={navigation} />

        <Overlay
          isVisible={passwordInputModal}
          width="auto"
          height="auto"
          onBackdropPress={() =>
            this.setState({passwordInputModal: false, editMode: false})
          }
          overlayStyle={{borderRadius: 10, padding: 2, margin: 20}}>
          <View style={{borderRadius: 10, flexDirection: 'column'}}>
            <CardItem
              header
              bordered
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 20}}>Confirm Password</Text>

              <Button
                type="clear"
                icon={<Icon name="x" color={colors.primary} />}
                containerStyle={{alignSelf: 'flex-end'}}
                buttonStyle={{borderRadius: 20}}
                onPress={() =>
                  this.setState({passwordInputModal: false, editMode: false})
                }
              />
            </CardItem>
            <CardItem style={{flexDirection: 'column'}}>
              <Text>
                Please confirm your password to continue updating your account
                details.
              </Text>

              <Input
                placeholder="Current Password"
                containerStyle={{paddingTop: 15}}
                style={[styles.textInput]}
                secureTextEntry
                maxLength={32}
                autoCapitalize="none"
                value={currentPassword}
                onChangeText={(value) =>
                  this.setState({currentPassword: value})
                }
              />
              <Button
                title="Confirm"
                type="clear"
                containerStyle={{alignSelf: 'flex-end'}}
                buttonStyle={{borderRadius: 20}}
                onPress={() => this.handleSaveAccountDetails()}
              />
            </CardItem>
          </View>
        </Overlay>

        <View style={{paddingHorizontal: 15, paddingVertical: 10}}>
          <Card style={{borderRadius: 10, overflow: 'hidden'}}>
            <CardItem
              header
              bordered
              style={{
                justifyContent: 'space-between',
                paddingBottom: 10,
                paddingTop: 10,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'ProductSans-Regular',
                  fontSize: 20,
                }}>
                Contact Details
              </Text>

              {!editMode ? (
                <Button
                  type="clear"
                  buttonStyle={{borderRadius: 24}}
                  icon={<Icon name="edit" color={colors.primary} />}
                  onPress={() => this.setState({editMode: true})}
                />
              ) : (
                <Button
                  type="clear"
                  buttonStyle={{borderRadius: 24}}
                  icon={<Icon name="x" color={colors.primary} />}
                  onPress={() => this.resetData()}
                />
              )}
            </CardItem>

            <CardItem
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'ProductSans-Bold',
                    fontSize: 16,
                    textAlignVertical: 'center',
                    alignSelf: 'center',
                  }}>
                  Display Name:{' '}
                </Text>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 10,
                  }}>
                  {!editMode ? (
                    <Text style={{fontSize: 16, textAlign: 'right'}}>
                      {userName}
                    </Text>
                  ) : (
                    <Input
                      inputStyle={{
                        textAlign: 'right',
                        fontSize: 16,
                        fontFamily: 'ProductSans-Light',
                      }}
                      inputContainerStyle={{
                        borderColor: 'rgba(0, 0, 0, 0)',
                      }}
                      containerStyle={{
                        borderRadius: 24,
                        borderColor: colors.primary,
                        borderWidth: 1,
                        height: 50,
                      }}
                      value={newDisplayName}
                      onChangeText={(value) =>
                        this.setState({newDisplayName: value})
                      }
                    />
                  )}
                </View>
              </View>
            </CardItem>

            <CardItem
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'ProductSans-Bold',
                    fontSize: 16,
                    textAlignVertical: 'center',
                    alignSelf: 'center',
                  }}>
                  Email address:{' '}
                </Text>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 10,
                  }}>
                  {!editMode ? (
                    <Text style={{fontSize: 16, textAlign: 'right'}}>
                      {userEmail}
                    </Text>
                  ) : (
                    <Input
                      inputStyle={{
                        textAlign: 'right',
                        fontSize: 16,
                        fontFamily: 'ProductSans-Light',
                      }}
                      inputContainerStyle={{
                        borderColor: 'rgba(0, 0, 0, 0)',
                      }}
                      containerStyle={{
                        borderRadius: 24,
                        borderColor: colors.primary,
                        borderWidth: 1,
                        height: 50,
                      }}
                      value={newEmail}
                      onChangeText={(value) => this.setState({newEmail: value})}
                    />
                  )}
                </View>
              </View>
            </CardItem>

            <CardItem
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'ProductSans-Bold',
                    fontSize: 16,
                    textAlignVertical: 'center',
                    alignSelf: 'center',
                  }}>
                  Mobile Number:{' '}
                </Text>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 10,
                  }}>
                  {!editMode ? (
                    <Text style={{fontSize: 16, textAlign: 'right'}}>
                      {userPhoneNumber}
                    </Text>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          alignSelf: 'center',
                          marginRight: 10,
                          fontFamily: 'ProductSans-Regular',
                          fontSize: 16,
                        }}>
                        +63
                      </Text>

                      <Input
                        maxLength={10}
                        inputStyle={{
                          textAlign: 'right',
                          fontSize: 16,
                          fontFamily: 'ProductSans-Light',
                        }}
                        inputContainerStyle={{
                          borderColor: 'rgba(0, 0, 0, 0)',
                        }}
                        containerStyle={{
                          borderRadius: 24,
                          borderColor: colors.primary,
                          borderWidth: 1,
                          height: 50,
                          flexShrink: 1,
                        }}
                        value={newPhoneNumber}
                        onChangeText={(value) =>
                          this.setState({newPhoneNumber: value})
                        }
                      />
                    </View>
                  )}
                </View>
              </View>
            </CardItem>

            {editMode && (
              <CardItem
                style={{alignItems: 'center', justifyContent: 'flex-end'}}>
                <Button
                  title="Save"
                  type="clear"
                  buttonStyle={{borderRadius: 20}}
                  onPress={() => this.handleCheckRequirements()}
                />
              </CardItem>
            )}
          </Card>
        </View>
      </View>
    );
  }
}

export default AccountScreen;
