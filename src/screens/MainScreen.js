import React, {Component} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {Header} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';

class MainScreen extends Component {
  render() {
    const {navigation} = this.props;

    return (
      <View style={styles.container}>
        <BaseHeader navigation={navigation} />
        <ScrollView></ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainScreen;
