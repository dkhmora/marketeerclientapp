import React, {Component} from 'react';
import App from '../App';
// For theme
import {colors} from '../../assets/colors';
import {ThemeProvider} from 'react-native-elements';
import {View, ActivityIndicator, StatusBar} from 'react-native';
import {inject, observer} from 'mobx-react';

const theme = {
  BaseHeader: {
    titleStyle: {color: colors.icons},
  },
  Icon: {
    type: 'feather',
  },
  Text: {
    style: {
      color: colors.text_primary,
      fontFamily: 'ProductSans-Light',
    },
  },
  Button: {
    titleStyle: {
      color: colors.primary,
      fontFamily: 'ProductSans-Bold',
    },
  },
  Avatar: {
    titleStyle: {
      fontFamily: 'ProductSans-Light',
      color: colors.primary,
    },
  },
  ListItem: {
    titleStyle: {
      fontSize: 16,
      fontFamily: 'ProductSans-Light',
    },
  },
  Input: {
    inputStyle: {
      fontFamily: 'ProductSans-Light',
    },
    errorStyle: {
      fontFamily: 'ProductSans-Light',
      color: colors.danger,
    },
    placeholderTextColor: colors.text_secondary,
  },
  CheckBox: {
    checkedColor: colors.accent,
    fontFamily: 'ProductSans-Light',
    containerStyle: {
      borderRadius: 30,
      backgroundColor: colors.icons,
      borderColor: colors.icons,
    },
  },
};
@inject('authStore')
@inject('generalStore')
@observer
class Setup extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <App />

        {!this.props.generalStore.appReady && (
          <View
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <StatusBar translucent backgroundColor="rgba(233, 30, 99,0.009)" />
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ThemeProvider>
    );
  }
}

export default Setup;
