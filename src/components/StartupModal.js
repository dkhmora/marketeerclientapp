import React, {PureComponent} from 'react';
import {Overlay, Text, Button, Icon} from 'react-native-elements';
import {View, SafeAreaView, StatusBar, Platform} from 'react-native';
import {colors} from '../../assets/colors';
import FastImage from 'react-native-fast-image';
import {inject} from 'mobx-react';

@inject('generalStore')
class StartupModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {isVisible: false};
  }

  componentDidMount() {
    const {
      props: {
        generalStore: {startupModalProps},
      },
    } = this;

    if (Object.keys(startupModalProps).length <= 0) {
      this.props.generalStore.setAppData().then(() => {
        this.setState({
          isVisible:
            startupModalProps?.isVisible !== undefined
              ? startupModalProps?.isVisible
              : false,
        });
      });
    }
  }

  render() {
    const {
      props: {
        generalStore: {
          startupModalProps: {
            overlayStyle,
            buttonStyle,
            buttonContainerStyle,
            image,
          },
        },
      },
      state: {isVisible},
    } = this;

    return (
      <Overlay
        isVisible={isVisible}
        fullScreen
        animationType="fade"
        width="auto"
        height="auto"
        statusBarTranslucent
        overlayStyle={{
          height: '85%',
          width: '85%',
          borderRadius: 10,
          padding: 0,
          ...overlayStyle,
        }}>
        <SafeAreaView style={{flex: 1}}>
          <StatusBar barStyle="light-content" />

          <FastImage
            style={{flex: 1}}
            source={{uri: image}}
            resizeMode={FastImage.resizeMode.contain}
          />

          <View style={{position: 'absolute', top: 10, right: 10}}>
            <Button
              type="solid"
              icon={<Icon name="x" color={colors.icons} />}
              buttonStyle={{
                borderRadius: 30,
                backgroundColor: colors.primary,
                ...buttonStyle,
              }}
              containerStyle={{
                borderRadius: 30,
                overflow: 'hidden',
                elevation: 5,
                ...buttonContainerStyle,
              }}
              onPress={() => this.setState({isVisible: false})}
            />
          </View>
        </SafeAreaView>
      </Overlay>
    );
  }
}

export default StartupModal;
