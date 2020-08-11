import React, {Component} from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {Header, Icon, Button, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import BaseOptionsMenu from './BaseOptionsMenu';

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
          containerStyle={{borderRadius: 24}}
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
          titleStyle={{color: colors.icons}}
          containerStyle={{borderRadius: 24}}
        />
      );
    }

    return null;
  };

  leftComponent = () => {
    const {backButton, noLeftComponent} = this.props;

    if (backButton) {
      return this.backButton();
    }

    if (noLeftComponent) {
      return null;
    }

    return this.menuButton();
  };

  centerComponent = () => {
    const {centerComponent, title} = this.props;

    if (centerComponent) {
      return centerComponent;
    }

    return (
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          fontSize: 20,
          color: colors.icons,
          textAlign: 'left',
        }}>
        {title}
      </Text>
    );
  };

  rightComponent = () => {
    const {actions, options, destructiveIndex, rightComponent} = this.props;

    if (options && actions) {
      return (
        <BaseOptionsMenu
          iconStyle={{color: colors.primary, marginRight: 10}}
          options={options}
          actions={actions}
          destructiveIndex={destructiveIndex}
        />
      );
    }

    if (rightComponent) {
      return rightComponent;
    }

    return <View style={{width: 40}} />;
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
            backgroundColor: colors.statusBar,
            translucent: true,
          }}
          containerStyle={styles.header}
          leftContainerStyle={{flex: 0}}
          rightContainerStyle={{flex: 0}}
          centerContainerStyle={{
            flex: 1,
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
