import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Header, Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';

class BaseHeader extends Component {
  constructor(props) {
    super(props);
  }

  leftIcon = () => {
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

  render() {
    return (
      <Header
        leftComponent={this.leftIcon}
        statusBarProps={{
          barStyle: 'light-content',
          backgroundColor: colors.primary,
          translucent: true,
        }}
        containerStyle={styles.header}
      />
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
});

export default BaseHeader;
