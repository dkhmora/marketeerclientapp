import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {Platform, TouchableHighlightBase, View} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {Button, Image, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {SCREEN_DIMENSIONS, STATUSBAR_HEIGHT} from '../util/variables';
import {
  requestNotifications,
  PERMISSIONS,
  request,
  check,
  checkNotifications,
} from 'react-native-permissions';
import Toast from '../components/Toast';

@inject('generalStore')
@inject('authStore')
@observer
class IntroSliderScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nextEnabled: true,
      skipEnabled: false,
      locationGranted: false,
      notificationsGranted: false,
    };
  }

  componentDidMount() {
    this.getNotificationPermissionStatus();
    this.getLocationPermissionStatus();
  }

  handleSliderDone() {
    this.props.generalStore.firstLoad = false;

    this.props.authStore.checkAuthStatus().then(() =>
      this.props.navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      }),
    );
  }

  handleGoToLogin() {
    this.props.generalStore.firstLoad = false;

    this.props.navigation.reset({
      index: 1,
      routes: [{name: 'Intro Slider'}, {name: 'Auth'}],
    });
  }

  getNotificationPermissionStatus() {
    return checkNotifications().then(({status, settings}) => {
      if (status === 'granted') {
        return this.setState({notificationsGranted: true});
      }

      return this.setState({notificationsGranted: false});
    });
  }

  getLocationPermissionStatus() {
    const platformLocationPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    return check(platformLocationPermission).then((status) => {
      if (status === 'granted') {
        return this.setState({locationGranted: true});
      }

      return this.setState({locationGranted: false});
    });
  }

  handleEnableLocation() {
    const platformLocationPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    return request(platformLocationPermission).then((permissionResult) => {
      if (permissionResult === 'granted') {
        Toast({text: 'Successfully granted location permissions!'});
      } else {
        Toast({
          text:
            'Location permissions not granted. Please set your location manually later.',
          type: 'danger',
        });
      }

      this.introRef.goToSlide(2);
    });
  }

  handleEnableNotifications() {
    return requestNotifications(['alert', 'badge', 'sound', 'lockScreen']).then(
      ({status, settings}) => {
        if (status === 'granted') {
          Toast({text: 'Thank you for enabling notifications!'});
        } else {
          Toast({
            text:
              "You wont be getting any notifications from us. Please enable it soon by navigating through your device's notification settings in order to get the best shopping experience.",
            type: 'danger',
          });
        }

        this.introRef.goToSlide(3);
      },
    );
  }

  renderItem = ({item}) => {
    const {height} = SCREEN_DIMENSIONS;
    return (
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          paddingTop: STATUSBAR_HEIGHT + 50,
          backgroundColor: item.backgroundColor,
          paddingHorizontal: 50,
        }}>
        <View style={{paddingHorizontal: 30}}>
          <Image
            source={item.image}
            style={{
              height: height * 0.3,
              width: '100%',
              resizeMode: 'contain',
              ...item.imageStyle,
            }}
          />
        </View>

        <View style={{flex: 1, paddingVertical: 30, marginBottom: 50}}>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: 30,
                color: colors.icons,
                marginVertical: 10,
                ...item.titleStyle,
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: colors.icons,
                marginVertical: 10,
                ...item.textStyle,
              }}>
              {item.text}
            </Text>
          </View>

          <View>{item.footerComponent && item.footerComponent()}</View>
        </View>
      </View>
    );
  };

  render() {
    const {
      nextEnabled,
      skipEnabled,
      notificationsGranted,
      locationGranted,
    } = this.state;
    const slides = [
      {
        key: 'one',
        title: 'Hi, welcome to Marketeer!',
        text: 'Marketeer makes shopping easier and convenient!',
        image: require('../../assets/images/logo.png'),
        backgroundColor: colors.primary,
      },
      {
        key: 'two',
        title: 'Location',
        titleStyle: {color: colors.icons},
        text:
          'Please enable location permissions in order to easily see the stores near you.',
        textStyle: {color: colors.icons},
        image: require('../../assets/images/map-intro.png'),
        backgroundColor: colors.accent,
        footerComponent: () => (
          <View>
            {locationGranted ? (
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 30,
                  padding: 10,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: colors.icons,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }}>
                  Thank you for enabling location permissions!
                </Text>
              </View>
            ) : (
              <Button
                title="Enable Location"
                buttonStyle={{
                  backgroundColor: colors.primary,
                  height: 50,
                  width: '100%',
                }}
                titleStyle={{color: colors.icons}}
                containerStyle={{borderRadius: 30, overflow: 'hidden'}}
                onPress={() => this.handleEnableLocation()}
              />
            )}
          </View>
        ),
      },
      {
        key: 'three',
        title: 'Notifications',
        text:
          'Please enable notifications to receive order and message updates.',
        image: require('../../assets/images/bell.png'),
        backgroundColor: colors.accent,
        footerComponent: () => (
          <View>
            {notificationsGranted ? (
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 30,
                  padding: 10,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: colors.icons,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }}>
                  Thank you for enabling notification permissions!
                </Text>
              </View>
            ) : (
              <Button
                title="Enable Notifications"
                buttonStyle={{
                  backgroundColor: colors.primary,
                  height: 50,
                  width: '100%',
                }}
                titleStyle={{color: colors.icons}}
                containerStyle={{borderRadius: 30, overflow: 'hidden'}}
                onPress={() => this.handleEnableNotifications()}
              />
            )}
          </View>
        ),
      },
      {
        key: 'four',
        title: 'Create an Account',
        text:
          "To place an order, you must be logged in to your account.\n\nIf you continue as a guest, we'll ask you to login/sign up before you place an order.\n\nEnjoy and happy shopping!",
        image: require('../../assets/images/user-intro.png'),
        imageStyle: {tintColor: colors.icons},
        backgroundColor: colors.accent,
        footerComponent: () => (
          <View>
            <Button
              title="Go to Login"
              buttonStyle={{
                backgroundColor: colors.primary,
                height: 50,
                width: '100%',
              }}
              titleStyle={{color: colors.icons}}
              containerStyle={{borderRadius: 30, overflow: 'hidden'}}
              onPress={() => this.handleGoToLogin()}
            />
          </View>
        ),
      },
    ];

    return (
      <AppIntroSlider
        ref={(introRef) => (this.introRef = introRef)}
        data={slides}
        renderItem={this.renderItem}
        onDone={() => this.handleSliderDone()}
        doneLabel="Continue as Guest"
        showNextButton={nextEnabled}
        showSkipButton={skipEnabled}
        onSlideChange={(nextIndex, lastIndex) => {
          if (nextIndex === 1) {
            this.getLocationPermissionStatus().then(() => {
              if (locationGranted) {
                return this.setState({nextEnabled: true, skipEnabled: false});
              }

              this.setState({nextEnabled: false, skipEnabled: true});
            });
          } else if (nextIndex === 2) {
            this.getNotificationPermissionStatus().then(() => {
              if (notificationsGranted) {
                return this.setState({nextEnabled: true, skipEnabled: false});
              }

              this.setState({nextEnabled: false, skipEnabled: true});
            });
          } else {
            this.setState({nextEnabled: true, skipEnabled: false});
          }
        }}
      />
    );
  }
}

export default IntroSliderScreen;
