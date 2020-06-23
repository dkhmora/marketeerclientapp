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
        <StatusBar translucent backgroundColor="rgba(0, 0, 0, 0.10)" />

        <View
          style={{
            height: 80,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}>
          <Image
            source={require('../../assets/images/logo_cart.png')}
            style={{
              height: 60,
              width: 80,
              resizeMode: 'center',
              marginRight: 10,
            }}
          />
          <Text style={{color: colors.icons, fontSize: 30}}>Cart</Text>
        </View>
        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={styles.footer}>
          <ScrollView>
            <CartStoreList />
          </ScrollView>
        </Animatable.View>
        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={{
            flexDirection: 'row',
            height: 100,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: colors.primary,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              marginRight: 10,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.icons,
              padding: 10,
            }}>
            <Text
              style={{
                fontFamily: 'ProductSans-Black',
                color: colors.icons,
                fontSize: 26,
              }}>
              P 123123
            </Text>
            <Text
              style={{
                color: colors.icons,
                fontSize: 16,
                alignSelf: 'center',
              }}>
              20 Items
            </Text>
          </View>
          <Button
            raised
            icon={<Icon name="arrow-right" color={colors.icons} />}
            iconRight
            title="Checkout"
            titleStyle={{
              color: colors.icons,
              fontFamily: 'ProductSans-Black',
              fontSize: 25,
              marginRight: '20%',
            }}
            buttonStyle={{flex: 1}}
            containerStyle={{
              flex: 1,
              borderRadius: 24,
              padding: 0,
            }}
          />
        </Animatable.View>
      </View>
    );
  }
}

export default CartScreen;
