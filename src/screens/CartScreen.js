import React, {Component} from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import CartStoreList from '../components/CartStoreList';
import BackButton from '../components/BackButton';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';

const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;

@inject('shopStore')
@inject('authStore')
@observer
class CartScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    crashlytics().log('CartScreen');
  }

  handleCheckout() {
    const {navigation} = this.props;

    this.props.authStore.checkAuthStatus().then(() => {
      if (this.props.authStore.guest) {
        navigation.navigate('Auth', {checkout: true});
      } else {
        navigation.navigate('Set Location', {checkout: true});
      }
    });
  }

  render() {
    const {navigation} = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <Animatable.View
          animation="fadeInUp"
          useNativeDriver
          duration={600}
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
              marginVertical: 15,
              resizeMode: 'cover',
              marginRight: 10,
            }}
          />
          <Text style={{color: colors.icons, fontSize: 30}}>Cart</Text>
        </Animatable.View>

        <Animatable.View
          useNativeDriver
          duration={600}
          animation="fadeInUpBig"
          style={[
            styles.footer,
            {
              paddingHorizontal: 0,
              overflow: 'hidden',
              paddingBottom: 100,
            },
          ]}>
          <CartStoreList
            cart
            emptyCartText={`This seems lonely...${'\n'}
              ${'\n'}Go back and visit a store now and add items to your cart!`}
          />
        </Animatable.View>

        <Animatable.View
          useNativeDriver
          duration={700}
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
            paddingTop: 10,
            paddingBottom: Platform.OS === 'android' ? 10 : 0,
            paddingHorizontal: 15,
            marginBottom: bottomPadding,
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
              ₱{this.props.shopStore.totalCartSubTotalAmount}
            </Text>

            <Text
              style={{
                color: colors.icons,
                fontSize: 16,
              }}>
              Subtotal
            </Text>
          </View>

          <View style={{borderRadius: 24, overflow: 'hidden', flex: 1}}>
            <Button
              onPress={() => this.handleCheckout()}
              disabled={
                this.props.shopStore.totalCartItemQuantity <= 0 ||
                !this.props.shopStore.validCheckout
              }
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
              buttonStyle={{
                height: '100%',
                borderRadius: 24,
                backgroundColor: colors.accent,
              }}
              containerStyle={{
                height: '100%',
                padding: 0,
              }}
            />
          </View>
        </Animatable.View>
      </SafeAreaView>
    );
  }
}

export default CartScreen;
