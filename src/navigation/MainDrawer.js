import React, {Component} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import MainScreen from '../screens/MainScreen';
import {Text, Icon, ListItem, Avatar} from 'react-native-elements';
import {View, Image, Linking} from 'react-native';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import Toast from '../components/Toast';

@inject('authStore')
@inject('shopStore')
@inject('generalStore')
@observer
class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.generalStore.navigation = this.props.navigation;
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

      this.props.generalStore.appReady = false;

      this.props.authStore
        .signOut()
        .then(() => this.props.authStore.checkAuthStatus())
        .then(() => {
          this.props.generalStore.appReady = true;
        })
        .then(() => {
          Toast({
            text: 'Signed out successfully',
            duration: 3500,
          });
        });
    } else {
      Toast({
        text: 'Failed to authenticate',
        duration: 3500,
        type: 'danger',
      });
    }
  }

  openTermsAndConditions() {
    const url = 'https://marketeer.ph/components/pages/termsandconditions';

    Linking.openURL(url);
  }

  openPrivacyPolicy() {
    const url = 'https://marketeer.ph/components/pages/privacypolicy';

    Linking.openURL(url);
  }

  openContactUs() {
    const url = 'https://marketeer.ph/components/pages/contactus';

    Linking.openURL(url);
  }

  customDrawer = (props) => {
    const {
      authenticationIcon,
      authenticationButtonText,
      userNameText,
      userInitial,
    } = this;

    const {navigation} = props;

    return (
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.primary,
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
              resizeMode: 'contain',
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
          {!this.props.authStore.guest && (
            <View>
              <ListItem
                title="Orders"
                leftIcon={
                  <Icon name="clipboard" color={colors.primary} size={18} />
                }
                onPress={() => navigation.navigate('Orders')}
              />

              <ListItem
                title="Account"
                leftIcon={<Icon name="user" color={colors.primary} size={18} />}
                onPress={() => navigation.navigate('Account')}
              />
            </View>
          )}

          <ListItem
            title="Help"
            leftIcon={
              <Icon name="help-circle" color={colors.primary} size={18} />
            }
            onPress={() => this.openContactUs()}
            bottomDivider
          />
          <ListItem
            title="Terms & Conditions"
            onPress={() => this.openTermsAndConditions()}
          />
          <ListItem
            title="Privacy Policy"
            onPress={() => this.openPrivacyPolicy()}
            bottomDivider
          />
          <ListItem
            title={authenticationButtonText}
            leftIcon={authenticationIcon}
            onPress={() => this.handleAuthentication(navigation)}
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
