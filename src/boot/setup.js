import React, {Component} from 'react';
import App from '../App';
// For theme
import {StyleProvider, Button, Container, Text} from 'native-base';
import getTheme from '../theme/components';
import variables from '../theme/variables/commonColor';
import material from '../theme/variables/material';

export default class Setup extends Component {
  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <App />
      </StyleProvider>
    );
  }
}
