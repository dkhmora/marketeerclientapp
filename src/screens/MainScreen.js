import React, {Component} from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {Header, Text} from 'react-native-elements';
import BaseHeader from '../components/BaseHeader';
import * as Animatable from 'react-native-animatable';

class MainScreen extends Component {
  deliveryLocationMenu = () => {
    let showLocation = false;

    return (
      <View>
        <TouchableOpacity onPress={() => (showLocation = !showLocation)}>
          <View style={{flex: 1}}>
            <Text>Deliver To: </Text>
          </View>
        </TouchableOpacity>
        <Animatable.View animation="slideInDown">
          {showLocation && (
            <View style={{width: '100%', height: 300, backgroundColor: '#fff'}}>
              <Text>Hello</Text>
            </View>
          )}
        </Animatable.View>
      </View>
    );
  };

  render() {
    const {navigation} = this.props;

    return (
      <View style={styles.container}>
        <BaseHeader
          title="Deliver"
          centerComponent={this.deliveryLocationMenu}
          navigation={navigation}
        />
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
