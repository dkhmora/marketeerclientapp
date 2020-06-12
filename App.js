/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {Provider} from 'mobx-react';
import SplashScreen from 'react-native-splash-screen';
import _ from 'lodash';
import moment from 'moment';

global._ = _;
global.moment = moment;

import GeneralStore from './src/store/generalStore';

import Setup from './src/boot/setup';

const generalStore = (window.store = new GeneralStore());
export default class App extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    return (
      <Provider generalStore={generalStore}>
        <Setup />
      </Provider>
    );
  }
}
