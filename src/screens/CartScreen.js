import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import CartStoreList from '../components/CartStoreList';

class CartScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.primary} />

        <View
          style={{
            flex: 2,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              height: 150,
              width: 200,
              resizeMode: 'center',
            }}
          />
        </View>
        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <ScrollView>
            <Text style={styles.text_header}>Cart</Text>
            <CartStoreList />
          </ScrollView>
        </Animatable.View>
        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={{
            flex: 1,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.primary,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}>
          <ScrollView>
            <Text style={styles.text_header}>Checkout</Text>
          </ScrollView>
        </Animatable.View>
      </View>
    );
  }
}

export default CartScreen;
