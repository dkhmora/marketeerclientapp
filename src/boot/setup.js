import React, {Component} from 'react';
import App from '../App';
// For theme
import {ThemeProvider} from 'react-native-elements';

const theme = {};
export default class Setup extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  }
}
