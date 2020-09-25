import React, {Component} from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import ItemCategoriesTab from '../navigation/ItemCategoriesTab';
import StoreDetailsModal from '../components/StoreDetailsModal';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import {Modalize} from 'react-native-modalize';
import SlidingCartHeader from '../components/SlidingCartHeader';
import CartStoreCard from '../components/CartStoreCard';
import SlidingCartFooter from '../components/SlidingCartFooter';
import crashlytics from '@react-native-firebase/crashlytics';

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
const SLIDING_MENU_INITIAL_HEIGHT = 75 + bottomPadding;
const SLIDING_MENU_EXTENDED_HEIGHT =
  SCREEN_HEIGHT - SLIDING_MENU_INITIAL_HEIGHT;
@inject('shopStore')
@inject('authStore')
@observer
class StoreScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storeItemCategories: {},
      ready: false,
      detailsModal: false,
    };

    const {store} = this.props.route.params;

    this.props.shopStore
      .setStoreItems(
        this.props.route.params.store.storeId,
        store.itemCategories,
      )
      .then(() => {
        this.setState({
          storeCategoryItems: this.props.shopStore.storeCategoryItems.get(
            store.storeId,
          ),
        });
      });
  }

  componentDidMount() {
    crashlytics().log('StoreScreen');
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

  fallValue = new Animated.Value(1);

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;
    const {navigation} = this.props;
    const {storeCategoryItems} = this.state;
    const dataSource = this.props.shopStore.cartStores.slice();
    const emptyCartText = 'Your cart is empty';

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <Animatable.View
          useNativeDriver
          animation="fadeInUp"
          duration={600}
          style={{flexDirection: 'row', paddingBottom: 20}}>
          <ImageBackground
            source={{uri: coverImageUrl}}
            style={{
              flex: 1,
              flexDirection: 'row',
              height: 200,
              resizeMode: 'cover',
              justifyContent: 'center',
              paddingTop: STATUS_BAR_HEIGHT + 20,
              paddingBottom: 40 + STATUS_BAR_HEIGHT,
              paddingHorizontal: 10,
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}>
            <Animatable.View
              useNativeDriver
              animation="fadeIn"
              duration={600}
              style={{
                flex: 1,
                height: SCREEN_HEIGHT,
                width: SCREEN_WIDTH,
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'absolute',
              }}
            />

            <Button
              onPress={() => navigation.goBack()}
              type="clear"
              color={colors.icons}
              icon={<Icon name="arrow-left" color={colors.primary} />}
              buttonStyle={{borderRadius: 30}}
              containerStyle={[
                styles.buttonContainer,
                {backgroundColor: '#fff', height: 40},
              ]}
            />

            <Animatable.Image
              animation="fadeInUp"
              useNativeDriver
              duration={600}
              source={{uri: displayImageUrl}}
              style={{
                height: 75,
                width: 75,
                borderRadius: 8,
                borderWidth: 0.7,
                borderColor: 'rgba(0,0,0,0.6)',
                marginHorizontal: 10,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            />

            <Animatable.View
              animation="fadeInUp"
              useNativeDriver
              duration={600}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.text_footer,
                  {
                    color: colors.icons,
                    fontSize: 30,
                    flex: 1,
                    paddingRight: 10,
                  },
                ]}>
                {store.storeName}
              </Text>

              <Button
                type="clear"
                onPress={() => {
                  this.sheetRef.snapTo(1);
                  this.modalizeRef.close();
                }}
                buttonStyle={{borderRadius: 30}}
                containerStyle={[
                  styles.buttonContainer,
                  {backgroundColor: '#fff', height: 40},
                ]}
                icon={
                  <Icon
                    name="info"
                    color={colors.primary}
                    style={{color: '#fff'}}
                  />
                }
              />
            </Animatable.View>
          </ImageBackground>
        </Animatable.View>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{
            width: 200,
            height: 150,
            resizeMode: 'contain',
            position: 'absolute',
            top: '50%',
            left: '25%',
          }}
        />
        <Animatable.View
          animation="fadeInUpBig"
          duration={600}
          useNativeDriver
          style={[
            styles.footer,
            {
              paddingHorizontal: 0,
              paddingTop: 0,
              marginTop: -80,
              overflow: 'hidden',
            },
          ]}>
          <ItemCategoriesTab
            storeCategoryItems={storeCategoryItems}
            storeId={store.storeId}
            style={{paddingBottom: 60 + bottomPadding}}
          />
        </Animatable.View>

        <Modalize
          ref={(modalizeRef) => (this.modalizeRef = modalizeRef)}
          alwaysOpen={60 + bottomPadding}
          scrollViewProps={{
            style: {
              flex: 1,
              paddingHorizontal: 10,
            },
          }}
          handleStyle={{backgroundColor: colors.text_secondary, opacity: 0.85}}
          panGestureComponentEnabled
          modalStyle={{
            backgroundColor: colors.icons,
            borderWidth: 0.8,
            borderColor: 'rgba(0,0,0,0.2)',
          }}
          HeaderComponent={() => (
            <SlidingCartHeader
              handleCheckout={() => this.handleCheckout()}
              onPress={() => this.modalizeRef.open('top')}
            />
          )}
          FooterComponent={() => (
            <SlidingCartFooter
              bottomPadding={bottomPadding}
              handleCheckout={() => this.handleCheckout()}
            />
          )}>
          {dataSource.map((storeId, index) => {
            return (
              <CartStoreCard
                cart={false}
                checkout={false}
                storeId={storeId}
                key={storeId}
              />
            );
          })}
        </Modalize>

        {coverImageUrl && displayImageUrl && (
          <BottomSheet
            ref={(sheetRef) => (this.sheetRef = sheetRef)}
            snapPoints={[0, SCREEN_HEIGHT * 0.9]}
            borderRadius={30}
            initialSnap={0}
            onCloseEnd={() => this.modalizeRef.close('alwaysOpen')}
            renderContent={() => (
              <View
                style={{
                  backgroundColor: colors.icons,
                  height: SCREEN_HEIGHT * 0.9,
                }}>
                <StoreDetailsModal
                  store={store}
                  coverImageUrl={coverImageUrl}
                  displayImageUrl={displayImageUrl}
                />
              </View>
            )}
          />
        )}
      </View>
    );
  }
}

export default StoreScreen;
