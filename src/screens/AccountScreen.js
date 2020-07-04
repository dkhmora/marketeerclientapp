import React, {Component} from 'react';
import BaseHeader from '../components/BaseHeader';
import {View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Card, CardItem} from 'native-base';
import {Text, Button, Icon, Input} from 'react-native-elements';
import {colors} from '../../assets/colors';

@inject('authStore')
@observer
class AccountScreen extends Component {
  constructor(props) {
    super(props);

    const {userName, userEmail, userPhoneNumber} = this.props.authStore;

    this.state = {
      editMode: false,
      newEmail: userEmail,
      newDisplayName: userName,
      newPhoneNumber: userPhoneNumber,
    };
  }

  cancelEditMode() {
    const {userName, userEmail, userPhoneNumber} = this.props.authStore;

    this.setState({
      editMode: false,
      newEmail: userEmail,
      newDisplayName: userName,
      newPhoneNumber: userPhoneNumber,
    });
  }

  render() {
    const {navigation} = this.props;
    const {userName, userEmail, userPhoneNumber} = this.props.authStore;
    const {editMode, newDisplayName, newEmail, newPhoneNumber} = this.state;

    return (
      <View style={{flex: 1}}>
        <BaseHeader title={userName} backButton navigation={navigation} />

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
                  onPress={() => this.cancelEditMode()}
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
                        maxLength={13}
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
                <Button title="Save" type="clear" />
              </CardItem>
            )}
          </Card>
        </View>
      </View>
    );
  }
}

export default AccountScreen;
