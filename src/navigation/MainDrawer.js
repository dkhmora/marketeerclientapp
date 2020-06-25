import React, {Component} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import MainScreen from '../screens/MainScreen';
import {Text, Icon, ListItem, Avatar} from 'react-native-elements';
import {View, Image} from 'react-native';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';

@inject('authStore')
@inject('shopStore')
@observer
class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  @computed get authenticationButtonText() {
    return this.props.authStore.guest ? 'Log In' : 'Log Out';
  }

  @computed get authenticationIcon() {
    return this.props.authStore.guest ? (
      <Icon name="log-in" color={colors.primary} size={18} />
    ) : (
      <Icon name="log-out" color={colors.primary} size={18} />
    );
  }

  @computed get userNameText() {
    const {userName} = this.props.authStore;

    return userName ? userName : 'Guest Account';
  }

  @computed get userInitial() {
    return this.userNameText.charAt(0);
  }

  handleAuthentication(navigation) {
    if (this.props.authStore.guest && this.props.authStore.userAuthenticated) {
      navigation.closeDrawer();

      this.props.navigation.navigate('Auth');
    } else if (this.props.authStore.userAuthenticated) {
      navigation.closeDrawer();

      this.props.authStore
        .signOut()
        .then(() => this.props.authStore.checkAuthStatus())
        .then(() => {
          this.props.shopStore.unsubscribeToGetCartItems &&
            this.props.shopStore.unsubscribeToGetCartItems() &&
            this.props.shopStore.resetData();
        });
    } else {
      console.log('Failed to authenticate');
    }
  }

  customDrawer = (props) => {
    const {
      authenticationIcon,
      authenticationButtonText,
      userNameText,
      userInitial,
    } = this;

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
            width: '100%',
            flexDirection: 'column',
            paddingHorizontal: 20,
            justifyContent: 'space-between',
          }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 150,
              width: 150,
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
            flex: 1,
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
            title={authenticationButtonText}
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
