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
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import CartStoreList from '../components/CartStoreList';
import BackButton from '../components/BackButton';
import Toast from '../components/Toast';

@inject('shopStore')
@inject('authStore')
@inject('generalStore')
@observer
class CheckoutScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  async handlePlaceOrder() {
    const {navigation} = this.props;
    const cartStores = this.props.shopStore.cartStores.slice();
    const {userId} = this.props.authStore;
    const {
      currentLocation,
      currentLocationDetails,
      currentLocationGeohash,
      updateCoordinates,
      deliverToCurrentLocation,
      deliverToLastDeliveryLocation,
      deliverToSetLocation,
      userDetails,
    } = this.props.generalStore;
    const {
      storeList,
      storeCartItems,
      storeSelectedShipping,
      storeSelectedPaymentMethod,
    } = this.props.shopStore;

    const orderStoreList = await cartStores.map((storeName) => {
      return storeList.find((element) => element.storeName === storeName);
    });

    const {userName, userPhoneNumber} = this.props.authStore;

    let deliveryCoordinates = null;
    let deliveryAddress = null;

    if (deliverToCurrentLocation || deliverToSetLocation) {
      deliveryCoordinates = currentLocation;
      deliveryAddress = currentLocationDetails;
    } else if (deliverToLastDeliveryLocation) {
      deliveryCoordinates = userDetails.lastDeliveryLocation;
      deliveryAddress = userDetails.lastDeliveryLocationAddress;
    }

    this.setState({loading: true});

    const userCoordinates = await this.props.generalStore.getUserLocation();

    this.props.shopStore
      .placeOrder({
        deliveryCoordinates,
        deliveryAddress,
        userCoordinates,
        userName,
        userPhoneNumber,
        userId,
        storeCartItems,
        storeSelectedShipping,
        storeSelectedPaymentMethod,
        orderStoreList,
      })
      .then(() => {
        updateCoordinates(
          userId,
          currentLocation,
          currentLocationGeohash,
          currentLocationDetails,
        );
      })
      .then(() => {
        this.setState({loading: false});

        Toast({
          text: 'Orders Placed! Thank you for shopping at Marketeer!',
          duration: 5000,
        });

        navigation.navigate('Home');
      })
      .catch((err) => {
        navigation.navigate('Cart');

        Toast({
          text: `Error, something went wrong. Please check your cart if all items have stock left, then re-order.`,
          type: 'danger',
          duration: 8000,
        });
      });
  }

  componentWillUnmount() {
    const {userId} = this.props.authStore;
    const {getCartItems, unsubscribeToGetCartItems} = this.props.shopStore;

    !unsubscribeToGetCartItems && getCartItems(userId);
  }

  render() {
    const {navigation} = this.props;
    const {loading} = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

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
              marginVertical: 15,
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
            onPress={() => this.handlePlaceOrder()}
            raised
            disabled={loading}
            icon={<Icon name="arrow-right" color={colors.icons} />}
            iconRight
            title="Place Order"
            titleStyle={{
              color: colors.icons,
              fontFamily: 'ProductSans-Black',
              fontSize: 22,
              marginRight: '20%',
            }}
            buttonStyle={{height: '100%', backgroundColor: colors.accent}}
            containerStyle={{
              height: '100%',
              flex: 1,
              borderRadius: 24,
              padding: 0,
            }}
          />
        </Animatable.View>

        {loading && (
          <View
            style={{
              width: '100%',
              height: '120%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default CheckoutScreen;
