import React, {Component} from 'react';
import App from '../App';
// For theme
import {colors} from '../../assets/colors';
import {ThemeProvider} from 'react-native-elements';

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
export default class Setup extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  }
}
