import React, {Component} from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {Header, Icon, Button, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';

class BaseHeader extends Component {
  constructor(props) {
    super(props);
  }

  menuButton = () => {
    const {navigation} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={() => navigation.openDrawer()}
          type="clear"
          color={colors.icons}
          icon={<Icon name="menu" color={colors.icons} />}
          containerStyle={styles.buttonContainer}
        />
      );
    }

    return null;
  };

  backButton = () => {
    const {navigation} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={() => navigation.goBack()}
          type="clear"
          color={colors.icons}
          icon={<Icon name="arrow-left" color={colors.icons} />}
          containerStyle={styles.buttonContainer}
        />
      );
    }

    return null;
  };

  leftComponent = () => {
    const {backButton} = this.props;

    if (backButton) {
      return this.backButton();
    }

    return this.menuButton();
  };

  centerComponent = () => {
    const {centerComponent, title} = this.props;

    if (centerComponent) {
      return centerComponent;
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

  render() {
    return (
      <View>
        <Header
          placement={Platform.OS === 'ios' ? 'center' : 'left'}
          leftComponent={this.leftComponent}
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
