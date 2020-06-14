import React, {Component} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import MainScreen from '../screens/MainScreen';

class MainDrawer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const DrawerMain = createDrawerNavigator();

    return (
      <DrawerMain.Navigator initialRouteName="Main">
        <DrawerMain.Screen name="Main" component={MainScreen} />
      </DrawerMain.Navigator>
    );
  }
}

export default MainDrawer;
