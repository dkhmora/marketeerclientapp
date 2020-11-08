import React, {Component} from 'react';
import {
  View,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import ItemCategoriesTab from '../navigation/ItemCategoriesTab';
import StoreDetailsModal from '../components/StoreDetailsModal';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {Modalize} from 'react-native-modalize';
import SlidingCartHeader from '../components/SlidingCartHeader';
import CartStoreCard from '../components/CartStoreCard';
import SlidingCartFooter from '../components/SlidingCartFooter';
import crashlytics from '@react-native-firebase/crashlytics';
import {CDN_BASE_URL} from '../components/util/variables';
import FastImage from 'react-native-fast-image';

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
@inject('shopStore')
@inject('authStore')
@observer
class StoreScreen extends Component {
  constructor(props) {
    super(props);

    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;

    this.state = {
      storeItemCategories: {},
      displayImageUrl,
      coverImageUrl,
      ready: false,
      detailsModal: false,
      allowScrolling: false,
    };

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

  renderItem = ({item, index}) => (
    <CartStoreCard cart={false} checkout={false} storeId={item} key={item} />
  );

  render() {
    const {store} = this.props.route.params;
    const {navigation} = this.props;
    const {storeCategoryItems} = this.state;
    const dataSource = this.props.shopStore.cartStores.slice();
    const emptyCartText = 'Your cart is empty';
    const displayImageUrl = `${CDN_BASE_URL}${store.displayImage}`;
    const coverImageUrl = `${CDN_BASE_URL}${store.coverImage}`;

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <Animatable.View
          useNativeDriver
          animation="fadeInUp"
          duration={600}
          style={{flexDirection: 'row', paddingBottom: 20}}>
          <FastImage
            source={
              coverImageUrl
                ? {uri: coverImageUrl}
                : require('../../assets/images/black.jpg')
            }
            style={{
              flex: 1,
              flexDirection: 'row',
              height: 200,
              justifyContent: 'center',
              paddingTop: STATUS_BAR_HEIGHT + 20,
              paddingBottom: 40 + STATUS_BAR_HEIGHT,
              paddingHorizontal: 10,
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
            resizeMode={FastImage.resizeMode.cover}>
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
              source={
                displayImageUrl
                  ? {uri: displayImageUrl}
                  : require('../../assets/images/black.jpg')
              }
              style={{
                height: 75,
                width: 75,
                borderRadius: 8,
                borderWidth: 0.7,
                borderColor: 'rgba(255,255,255,0.4)',
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
                  this.storeDetailsModalRef &&
                    this.storeDetailsModalRef.modalizeRef.open('top');
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
          </FastImage>
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
            storeType={store.storeType}
            style={{paddingBottom: bottomPadding}}
          />
        </Animatable.View>

        <Modalize
          ref={(modalizeRef) => (this.modalizeRef = modalizeRef)}
          alwaysOpen={60 + bottomPadding}
          flatListProps={{
            ListEmptyComponent: (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: 'center',
                    paddingHorizontal: 15,
                  }}>
                  {emptyCartText}
                </Text>
              </View>
            ),
            data: dataSource ? dataSource : [],
            renderItem: this.renderItem,
            keyExtractor: (item, index) => item,
            contentContainerStyle: {flexGrow: 1},
            style: {paddingHorizontal: 10},
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
              onPress={() => this.modalizeRef && this.modalizeRef.open('top')}
            />
          )}
          FooterComponent={() => (
            <SlidingCartFooter
              bottomPadding={bottomPadding}
              handleCheckout={() => this.handleCheckout()}
            />
          )}
        />

        <StoreDetailsModal
          ref={(storeDetailsModalRef) =>
            (this.storeDetailsModalRef = storeDetailsModalRef)
          }
          store={store}
          coverImageUrl={coverImageUrl}
          displayImageUrl={displayImageUrl}
          onClose={() =>
            this.modalizeRef && this.modalizeRef.open('alwaysOpen')
          }
        />
      </View>
    );
  }
}

export default StoreScreen;
