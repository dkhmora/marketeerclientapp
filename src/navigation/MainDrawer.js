import React, {Component} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import MainScreen from '../screens/MainScreen';
import {Button, Text, Icon, ListItem, Avatar} from 'react-native-elements';
import {View, Platform, Image} from 'react-native';
import {colors} from '../../assets/colors';
import {inject, observer, Observer} from 'mobx-react';
import {color} from 'react-native-reanimated';
import {observable, computed} from 'mobx';

@inject('authStore')
@observer
class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  @computed get authenticationButtonText() {
    console.log(
      this.props.authStore.guest ? 'Log In' : 'Log Out',
      'authbuttontext',
    );
    console.log(this.props.authStore.authenticationButtonText, 'sa store2');
    return this.props.authStore.guest ? 'Log In' : 'Log Out';
  }

  handleAuthentication(navigation) {
    const {signOut} = this.props.authStore;

    if (this.props.authStore.guest && this.props.authStore.userAuthenticated) {
      navigation.closeDrawer();
      this.props.navigation.navigate('Auth');
    } else if (this.props.authStore.userAuthenticated) {
      signOut()
        .then(() => navigation.closeDrawer())
        .then(() => this.props.authStore.checkAuthStatus());
    } else {
      console.log('Failed to authenticate');
    }
  }

  customDrawer = (props) => {
    const {userAuthenticated, userName} = this.props.authStore;

    const authenticationIcon = this.props.authStore.guest ? (
      <Icon name="log-in" color={colors.primary} size={18} />
    ) : (
      <Icon name="log-out" color={colors.primary} size={18} />
    );

    const userNameText = userName ? userName : 'Guest Account';
    let userInitial = userNameText.charAt(0);

    return (
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#E91E63',
        }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            flexDirection: 'column',
            paddingHorizontal: 20,
            justifyContent: 'space-between',
          }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 100,
              width: 100,
              resizeMode: 'center',
              alignSelf: 'center',
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 20,
            }}>
            <Avatar
              size="medium"
              rounded
              overlayContainerStyle={{backgroundColor: colors.icons}}
              title={userInitial}
              onPress={() => console.log('Works!')}
              activeOpacity={0.7}
            />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontFamily: 'ProductSans-Bold',
                color: colors.icons,
              }}>
              {userNameText}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 3,
            backgroundColor: '#fff',
            width: '100%',
          }}>
          <ListItem
            title="Orders"
            leftIcon={
              <Icon name="clipboard" color={colors.primary} size={18} />
            }
            onPress={() => console.log('yes')}
          />
          <ListItem
            title="Account"
            leftIcon={<Icon name="user" color={colors.primary} size={18} />}
            onPress={() => console.log('yes')}
          />
          <ListItem
            title="Help"
            leftIcon={
              <Icon name="help-circle" color={colors.primary} size={18} />
            }
            bottomDivider
            onPress={() => console.log('yes')}
          />
          <ListItem
            title="Settings"
            leftIcon={<Icon name="settings" color={colors.primary} size={18} />}
            topDivider
            onPress={() => console.log('yes')}
          />
          <ListItem
            title="Terms & Conditions / Privacy Policy"
            leftIcon={<Icon name="book" color={colors.primary} size={18} />}
            onPress={() => console.log('yes')}
          />
          <ListItem
            title={this.authenticationButtonText}
            leftIcon={authenticationIcon}
            onPress={() => this.handleAuthentication(props.navigation)}
          />
        </View>
      </DrawerContentScrollView>
    );
  };

  render() {
    const DrawerMain = createDrawerNavigator();

    return (
      <DrawerMain.Navigator
        initialRouteName="Main"
        drawerContent={(props) => {
          return this.customDrawer(props);
        }}
        drawerStyle={{
          width: '70%',
        }}>
        <DrawerMain.Screen name="Main" component={MainScreen} />
      </DrawerMain.Navigator>
    );
  }
}

export default MainDrawer;
