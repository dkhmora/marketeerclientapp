import {inject, observer} from 'mobx-react';
import React, {Component} from 'react';
import {StatusBar, View} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {Image, Text} from 'react-native-elements';
import {color} from 'react-native-reanimated';
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

  renderItem = ({item}) => {
    const {height, width} = SCREEN_DIMENSIONS;
    return (
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          paddingTop: STATUSBAR_HEIGHT + 50,
          backgroundColor: item.backgroundColor,
          paddingHorizontal: 50,
        }}>
        <Image
          source={item.image}
          style={{height: height * 0.3, width: '100%', resizeMode: 'contain'}}
        />

        <View style={{flex: 1, paddingVertical: 30}}>
          <Text style={{fontSize: 26, color: colors.icons, marginVertical: 10}}>
            {item.title}
          </Text>
          <Text style={{fontSize: 14, color: colors.icons, marginVertical: 10}}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    const slides = [
      {
        key: 'one',
        title: 'Welcome To Marketeer!',
        text: 'Description.\nSay something cool',
        image: require('../../assets/images/logo.png'),
        backgroundColor: colors.primary,
      },
      {
        key: 'two',
        title: 'Title 2',
        text: 'Other cool stuff',
        image: require('../../assets/images/logo.png'),
        backgroundColor: '#febe29',
      },
      {
        key: 'three',
        title: 'Rocket guy',
        text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
        image: require('../../assets/images/logo.png'),
        backgroundColor: '#22bcb5',
      },
    ];

    return (
      <AppIntroSlider
        data={slides}
        renderItem={this.renderItem}
        onDone={() => this.handleSliderDone()}
      />
    );
  }
}

export default IntroSliderScreen;
