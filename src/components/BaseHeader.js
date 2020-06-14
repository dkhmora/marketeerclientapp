import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
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
