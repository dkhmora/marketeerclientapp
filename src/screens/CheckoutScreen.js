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
import Toast from '../components/Toast';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';

const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
@inject('shopStore')
@inject('authStore')
@inject('generalStore')
@observer
class CheckoutScreen extends Component {
  constructor(props) {
    super(props);
  }

  async handlePlaceOrder() {
    const {navigation} = this.props;
    const {
      currentLocation,
      currentLocationDetails,
      currentLocationGeohash,
    } = this.props.generalStore;
    const {
      storeSelectedDeliveryMethod,
      storeSelectedPaymentMethod,
      storeUserEmail,
      storeAssignedMerchantId,
    } = this.props.shopStore;

    const {userName} = this.props.authStore;

    const deliveryCoordinates = currentLocation;
    const deliveryAddress = currentLocationDetails;
    const deliveryCoordinatesGeohash = currentLocationGeohash;

    this.props.generalStore.appReady = false;

    const userCoordinates = await this.props.generalStore.getUserLocation();

    this.props.shopStore
      .placeOrder({
        deliveryCoordinates,
        deliveryCoordinatesGeohash,
        deliveryAddress,
        userCoordinates,
        userName,
        storeSelectedDeliveryMethod,
        storeSelectedPaymentMethod,
        storeAssignedMerchantId,
        storeUserEmail,
      })
      .then(async (response) => {
        this.props.generalStore.appReady = true;

        if (response.data.s === 400) {
          Toast({
            text: response.data.m,
            type: 'danger',
            duration: 6000,
          });

          navigation.reset({
            index: 1,
            routes: [{name: 'Home'}, {name: 'Cart'}],
          });
        } else {
          let responses = '';

          await response.data.map((res) => {
            if (res.s === 200) {
              responses = `${responses !== '' ? `${responses}; ` : ''}${
                res.m
              }; Thank you for shopping at Marketeer!`;
            }
          });

          if (responses) {
            Toast({
              text: responses,
              duration: 5000,
            });

            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          }
        }
      });
  }

  componentDidMount() {
    this.props.generalStore.setAppData();

    crashlytics().log('CheckoutScreen');
  }

  componentWillUnmount() {
    const {userId} = this.props.authStore;
    const {getCartItems, unsubscribeToGetCartItems} = this.props.shopStore;

    !unsubscribeToGetCartItems && getCartItems(userId);

    this.props.shopStore.storeSelectedDeliveryMethod = {};
    this.props.shopStore.storeSelectedPaymentMethod = {};
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
              resizeMode: 'cover',
              marginRight: 10,
              marginVertical: 15,
            }}
          />
          <Text style={{color: colors.icons, fontSize: 30}}>Checkout</Text>
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
            checkout
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
              height: '100%',
              width: '30%',
              marginRight: 10,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.icons,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
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
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: colors.icons,
                fontSize: 16,
                textAlign: 'center',
              }}>
              Total Amount
            </Text>
          </View>

          <View
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              flex: 1,
            }}>
            <Button
              onPress={() => this.handlePlaceOrder()}
              raised
              disabled={
                this.props.generalStore.appReady === false ||
                !this.props.shopStore.validPlaceOrder
              }
              icon={<Icon name="arrow-right" color={colors.icons} />}
              iconRight
              title="Place Order"
              titleStyle={{
                color: colors.icons,
                fontFamily: 'ProductSans-Black',
                fontSize: 22,
                marginRight: '20%',
              }}
              buttonStyle={{
                height: '100%',
                backgroundColor: colors.accent,
                borderRadius: 24,
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

export default CheckoutScreen;
