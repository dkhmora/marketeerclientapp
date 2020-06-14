import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Header, Text, ListItem, Button, Icon} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';

class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLocation: false,
      initialPosition: -200,
    };
    const headerHeight = Platform.OS === 'android' ? 56 : 44;

    const pixelsFromTop = getStatusBarHeight() + headerHeight;

    Animatable.initializeRegistryWithDefinitions({
      slideIn: {
        from: {translateY: -pixelsFromTop},
        to: {translateY: pixelsFromTop},
      },
      slideOut: {
        from: {translateY: pixelsFromTop},
        to: {translateY: -pixelsFromTop},
      },
      fadeIn: {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 0.35,
        },
      },
      fadeOut: {
        from: {
          opacity: 0.35,
        },
        to: {
          opacity: 0,
        },
      },
    });
  }

  menuIcon = () => {
    const {navigation} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={() => navigation.openDrawer()}
          type="clear"
          color={colors.icons}
          icon={<Icon name="menu" color={colors.icons} />}
          containerStyle={styles.buttonContainer}
          titleStyle={{color: colors.icons}}
        />
      );
    }

    return null;
  };

  rightComponent = () => {
    const {rightComponent} = this.props;

    if (rightComponent) {
      return <View style={{flex: 1}}></View>;
    }

    return <View style={{flex: 1}}></View>;
  };

  centerComponent = () => {
    const {centerComponent, title} = this.props;
    const {showLocation} = this.state;

    return (
      <TouchableOpacity
        style={{flex: 1, flexDirection: 'row'}}
        onPress={() => {
          this.setState({initialPosition: 0});
          if (!showLocation) {
            this.revealLocationMenu();
          } else {
            this.hideLocationMenu();
          }
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text style={styles.titleText}>Deliver To: </Text>
        </View>
      </TouchableOpacity>
    );
  };

  SlideDownDrawer = () => {
    return (
      <Animatable.View
        ref={(drawer) => (this.drawer = drawer)}
        duration={200}
        useNativeDriver
        style={{
          width: '100%',
          backgroundColor: '#fff',
          top: this.state.initialPosition,
          zIndex: -2,
          position: 'absolute',
        }}>
        <ListItem
          title="Current Location"
          subtitle="Test Location"
          bottomDivider
          chevron
          onPress={() => console.log('yes')}
        />
        <ListItem
          title="Last Location Delivery"
          subtitle="Test Location"
          bottomDivider
          chevron
          onPress={() => console.log('yes')}
        />
      </Animatable.View>
    );
  };

  Overlay = () => {
    return (
      <Animatable.View
        ref={(overlay) => (this.overlay = overlay)}
        useNativeDriver
        duration={200}
        style={{
          position: 'absolute',
          height: Dimensions.get('window').height + 400,
          width: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: -100,
          opacity: 0,
          backgroundColor: '#000',
        }}>
        <TouchableOpacity
          style={{flex: 1}}
          onPress={() => this.hideLocationMenu()}
        />
      </Animatable.View>
    );
  };

  revealLocationMenu() {
    this.setState({showLocation: true}, () => {
      this.drawer.animate('slideIn');
      this.overlay.animate('fadeIn');
    });
  }

  hideLocationMenu() {
    this.drawer.animate('slideOut');
    this.overlay.animate('fadeOut');

    this.setState({showLocation: false});
  }

  render() {
    const {navigation} = this.props;
    const {showLocation} = this.state;

    return (
      <View style={styles.container}>
        {showLocation && <this.Overlay />}
        <this.SlideDownDrawer />
        <Header
          placement={Platform.OS === 'ios' ? 'center' : 'left'}
          leftComponent={this.menuIcon}
          centerComponent={this.centerComponent}
          rightComponent={this.rightComponent}
          statusBarProps={{
            barStyle: 'light-content',
            backgroundColor: colors.primary,
            translucent: true,
          }}
          containerStyle={styles.header}
          centerContainerStyle={{
            flex: 3,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    justifyContent: 'space-around',
    zIndex: 1,
  },
  buttonContainer: {
    borderRadius: 24,
    color: '#fff',
  },
  titleText: {
    fontSize: 16,
    color: colors.icons,
  },
});

export default MainScreen;
