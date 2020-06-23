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
  SafeAreaView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import CartStoreList from '../components/CartStoreList';
import BackButton from '../components/BackButton';

@inject('shopStore')
@observer
class CheckoutScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {navigation} = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar animated translucent backgroundColor="rgba(0, 0, 0, 0.10)" />

        <Animatable.View
          animation="fadeInUp"
          useNativeDriver
          duration={800}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}>
          <BackButton navigation={navigation} />

          <Image
            source={require('../../assets/images/logo_cart.png')}
            style={{
              height: 65,
              width: 80,
              resizeMode: 'cover',
              marginRight: 10,
            }}
          />
          <Text style={{color: colors.icons, fontSize: 30}}>Checkout</Text>
        </Animatable.View>

        <Animatable.View
          useNativeDriver
          animation="fadeInUpBig"
          style={[styles.footer, {paddingBottom: 100}]}>
          <CartStoreList
            checkout
            emptyCartText={`This seems lonely...${'\n'}
              ${'\n'}Go back and visit a store now and add items to your cart!`}
          />
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
              width: '30%',
              marginRight: 10,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.icons,
              padding: 10,
              alignItems: 'center',
            }}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                width: '100%',
                textAlign: 'center',
                fontFamily: 'ProductSans-Black',
                color: colors.icons,
                fontSize: 26,
              }}>
              ₱ {this.props.shopStore.totalCartSubTotal}
            </Text>

            <Text
              style={{
                color: colors.icons,
                fontSize: 16,
              }}>
              Total Amount
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
              fontSize: 22,
              marginRight: '20%',
            }}
            buttonStyle={{height: '100%'}}
            containerStyle={{
              height: '100%',
              flex: 1,
              borderRadius: 24,
              padding: 0,
            }}
          />
        </Animatable.View>
      </SafeAreaView>
    );
  }
}

export default CheckoutScreen;
