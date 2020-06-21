import React, {Component} from 'react';
import App from '../App';
// For theme
import {colors} from '../../assets/colors';
import {ThemeProvider} from 'react-native-elements';
import {inject} from 'mobx-react';

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
};
@inject('authStore')
class Setup extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  }
}

export default Setup;
