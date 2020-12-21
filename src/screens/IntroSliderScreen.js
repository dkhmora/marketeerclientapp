import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {View} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {Button, Image, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {SCREEN_DIMENSIONS, STATUSBAR_HEIGHT} from '../util/variables';

@inject('generalStore')
@observer
class IntroSliderScreen extends Component {
  constructor(props) {
    super(props);
  }

  handleSliderDone() {
    this.props.generalStore.firstLoad = false;

    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  }

  handleGoToLogin() {
    this.props.generalStore.firstLoad = false;

    this.props.navigation.reset({
      index: 1,
      routes: [{name: 'Home'}, {name: 'Auth'}],
    });
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
            <Button
              title="Enable Location"
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
      {
        key: 'three',
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
        data={slides}
        renderItem={this.renderItem}
        onDone={() => this.handleSliderDone()}
        doneLabel="Continue as Guest"
      />
    );
  }
}

export default IntroSliderScreen;
