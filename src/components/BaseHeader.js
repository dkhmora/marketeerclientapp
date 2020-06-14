import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Header,
  Icon,
  Button,
  Text,
  ListItem,
  Overlay,
} from 'react-native-elements';
import {colors} from '../../assets/colors';
import * as Animatable from 'react-native-animatable';

class BaseHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLocation: false,
    };

    Animatable.initializeRegistryWithDefinitions({
      slideIn: {
        from: {translateY: -200},
        to: {translateY: 100},
      },
      slideOut: {
        from: {translateY: 100},
        to: {translateY: -200},
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

  centerComponent = () => {
    const {centerComponent, title} = this.props;
    const {showLocation} = this.state;

    if (centerComponent) {
      return (
        <TouchableOpacity
          style={{flex: 1, flexDirection: 'row'}}
          onPress={() => {
            if (!showLocation) {
              this.drawer.animate('slideIn');
              this.overlay.animate('fadeIn');
            } else {
              this.drawer.animate('slideOut');
              this.overlay.animate('fadeOut');
            }

            this.setState({showLocation: !showLocation});
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
    }

    return <Text style={styles.titleText}>{title}</Text>;
  };

  rightComponent = () => {
    const {rightComponent} = this.props;

    if (rightComponent) {
      return <View style={{flex: 1}}></View>;
    }

    return <View style={{flex: 1}}></View>;
  };

  slideDownDrawer = () => {
    return (
      <View style={{flex: 1}}>
        <Animatable.View
          ref={(drawer) => (this.drawer = drawer)}
          duration={200}
          style={{
            width: '100%',
            backgroundColor: '#fff',
            zIndex: -10,
            translateY: -200,
            position: 'absolute',
          }}>
          <ListItem
            title="Current Location"
            subtitle="Test Location"
            bottomDivider
            chevron
          />
          <ListItem
            title="Last Location Delivery"
            subtitle="Test Location"
            bottomDivider
            chevron
          />
          <Animatable.View
            ref={(overlay) => (this.overlay = overlay)}
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
            }}
          />
        </Animatable.View>
      </View>
    );
  };

  render() {
    const {showLocation} = this.state;

    return (
      <View>
        {this.slideDownDrawer()}
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
  header: {
    backgroundColor: colors.primary,
    justifyContent: 'space-around',
    zIndex: 100,
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

export default BaseHeader;
