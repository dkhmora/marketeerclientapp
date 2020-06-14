import React, {Component} from 'react';
import {StyleSheet, Platform, View, TouchableOpacity} from 'react-native';
import {Header, Icon, Button, Text} from 'react-native-elements';
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
        to: {translateY: 0},
      },
      slideOut: {
        from: {translateY: 0},
        to: {translateY: -200},
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
              this.view.animate('slideIn');
            } else {
              this.view.animate('slideOut');
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
      <View>
        <Animatable.View
          ref={(view) => (this.view = view)}
          duration={200}
          style={{
            width: '100%',
            height: 200,
            backgroundColor: '#fff',
            zIndex: -99,
            translateY: -200,
            position: 'absolute',
          }}>
          <Text>Hello World</Text>
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
