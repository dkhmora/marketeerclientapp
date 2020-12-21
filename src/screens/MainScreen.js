import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  AppState,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {
  Header,
  Text,
  ListItem,
  Button,
  Icon,
  Image,
  Badge,
} from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import MainTab from '../navigation/MainTab';
import {computed} from 'mobx';
import crashlytics from '@react-native-firebase/crashlytics';
import auth from '@react-native-firebase/auth';
import {requestNotifications} from 'react-native-permissions';

const headerHeight = Platform.OS === 'android' ? 56 : 44;
const pixelsFromTop = getStatusBarHeight() + headerHeight;
@inject('shopStore')
@inject('authStore')
@inject('generalStore')
@observer
class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locationMenuOpen: false,
      initialPosition: -400,
      image: '',
      url: '',
    };

    Animatable.initializeRegistryWithDefinitions({
      transformPlusButton: {
        from: {borderBottomLeftRadius: 24, borderTopLeftRadius: 24},
        to: {borderBottomLeftRadius: 0, borderTopLeftRadius: 0},
      },
      deTransformPlusButton: {
        from: {borderBottomLeftRadius: 0, borderTopLeftRadius: 0},
        to: {borderBottomLeftRadius: 24, borderTopLeftRadius: 24},
      },
      fadeIn: {
        from: {opacity: 0},
        to: {opacity: 1},
      },
      fadeInOverlay: {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 0.35,
        },
      },
      fadeOutOverlay: {
        from: {
          opacity: 0.35,
        },
        to: {
          opacity: 0,
        },
      },
    });
  }

  @computed get deliverToText() {
    const {
      userDetails,
      currentLocationDetails,
      selectedDeliveryLabel,
    } = this.props.generalStore;

    if (
      selectedDeliveryLabel === 'Current Location' ||
      selectedDeliveryLabel === 'Set Location'
    ) {
      return currentLocationDetails;
    } else if (
      selectedDeliveryLabel === 'Last Delivery Location' &&
      userDetails.addresses
    ) {
      return userDetails?.addresses?.Home?.address;
    } else {
      return 'Current Location';
    }
  }

  componentDidMount() {
    crashlytics().log('MainScreen');

    this.executeAuthStateListener();
  }

  componentWillUnmount() {
    this.closeAuthStateListener && this.closeAuthStateListener();
  }

  executeAuthStateListener() {
    this.closeAuthStateListener = auth().onAuthStateChanged((user) => {
      this.props.generalStore.appReady = false;

      this.props.authStore.checkAuthStatus().then(() => {
        if (user) {
          const {isAnonymous, email, displayName, phoneNumber, uid} = user;

          this.setState({user}, () => {
            crashlytics().setAttributes({
              email,
              displayName,
              phoneNumber,
              uid,
              isAnonymous: isAnonymous.toString(),
            });
          });

          if (!this.props.authStore.guest) {
            this.props.authStore.reloadUser().then(() => {
              if (this.props.shopStore.cartStores.length !== 0) {
                this.props.shopStore.updateCartItemsInstantly().then(() => {
                  this.props.shopStore.getCartItems(uid);
                });
              } else {
                this.props.shopStore.getCartItems(uid);
              }

              requestNotifications(['alert', 'badge', 'sound', 'lockScreen'])
                .then(({status, settings}) => {
                  return this.props.generalStore.getUserDetails(uid);
                })
                .then(() => (this.props.generalStore.appReady = true));

              if (!this.props.generalStore.currentLocation) {
                return this.props.generalStore.setCurrentLocation();
              } else {
                return this.props.generalStore.setLastDeliveryLocation();
              }
            });
          } else {
            if (this.props.shopStore.unsubscribeToGetCartItems) {
              this.props.shopStore.unsubscribeToGetCartItems();
            }

            if (this.props.generalStore.unsubscribeUserDetails) {
              this.props.generalStore.unsubscribeUserDetails();
            }

            if (!this.props.generalStore.currentLocation) {
              return this.props.generalStore.setCurrentLocation();
            }
          }

          AppState.addEventListener('change', (state) => {
            if (!this.props.authStore.guest) {
              if (state === 'active') {
                if (!this.props.uthStore.guest && user) {
                  this.props.shopStore.getCartItems(uid);
                  this.props.generalStore.getUserDetails(uid);
                }
              } else if (state === 'background') {
                if (this.props.shopStore.unsubscribeToGetCartItems) {
                  this.props.shopStore.unsubscribeToGetCartItems();
                }

                if (this.props.generalStore.unsubscribeUserDetails) {
                  this.props.generalStore.unsubscribeUserDetails();
                }
              } else if (state === 'inactive') {
                if (this.props.shopStore.unsubscribeToGetCartItems) {
                  this.props.shopStore.unsubscribeToGetCartItems();
                }

                if (this.props.generalStore.unsubscribeUserDetails) {
                  this.props.generalStore.unsubscribeUserDetails();
                }
              }
            }
          });
        }
      });
    });
  }

  menuButton = () => {
    const {navigation} = this.props;
    const {locationMenuOpen} = this.state;

    if (navigation) {
      return (
        <Button
          onPress={() => {
            if (locationMenuOpen) {
              this.hideLocationMenu();
            }
            navigation.openDrawer();
          }}
          type="clear"
          color={colors.icons}
          icon={<Icon name="menu" color={colors.icons} />}
          containerStyle={styles.buttonContainer}
          titleStyle={{color: colors.icons}}
        />
      );
    }

    return null;
  };

  onLayout(event) {
    const drawerHeight = event.nativeEvent.layout.height;

    Animatable.initializeRegistryWithDefinitions({
      slideIn: {
        from: {translateY: -pixelsFromTop},
        to: {translateY: pixelsFromTop},
      },
      slideOut: {
        from: {translateY: pixelsFromTop},
        to: {translateY: -pixelsFromTop - drawerHeight},
      },
    });
  }

  rightComponent = ({cartQuantity}) => {
    const {navigation} = this.props;
    const {locationMenuOpen} = this.state;

    return (
      <View>
        <Button
          onPress={() => {
            if (locationMenuOpen) {
              this.hideLocationMenu();
            }
            navigation.navigate('Cart');
          }}
          type="clear"
          color={colors.icons}
          icon={
            <Image
              source={require('../../assets/images/logo_cart.png')}
              style={{width: 30, height: 30, resizeMode: 'contain'}}
              textStyle={{fontFamily: 'ProductSans-Light'}}
            />
          }
          containerStyle={styles.buttonContainer}
          titleStyle={{color: colors.icons}}
        />

        <Badge
          value={cartQuantity}
          badgeStyle={{backgroundColor: colors.accent}}
          containerStyle={{position: 'absolute', top: 8, right: 2}}
        />
      </View>
    );
  };

  centerComponent = ({deliverToText}) => {
    const {locationMenuOpen} = this.state;

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          marginHorizontal: -10,
        }}
        onPress={() => {
          this.setState({initialPosition: 0});
          if (!locationMenuOpen) {
            this.revealLocationMenu();
          } else {
            this.hideLocationMenu();
          }
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Text style={styles.header_titleText}>Deliver To: </Text>

          {!this.props.generalStore.addressLoading ? (
            <Text
              numberOfLines={1}
              style={{
                color: colors.icons,
                fontSize: 18,
                fontFamily: 'ProductSans-Black',
                flexWrap: 'wrap',
                flexShrink: 1,
              }}>
              {deliverToText}
            </Text>
          ) : (
            <ActivityIndicator size="small" color={colors.icons} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  SlideDownDrawer = () => {
    const {navigation} = this.props;

    return (
      <Animatable.View
        ref={(drawer) => (this.drawer = drawer)}
        duration={200}
        useNativeDriver
        onLayout={(layout) => this.onLayout(layout)}
        style={{
          width: '100%',
          backgroundColor: '#fff',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          overflow: 'hidden',
          top: this.state.initialPosition,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
        }}>
        <View
          style={{
            marginHorizontal: 10,
            marginTop: 10,
            marginBottom: 5,
          }}>
          <ListItem
            activeOpacity={0.95}
            title="Current Location"
            containerStyle={{
              backgroundColor:
                this.props.generalStore.selectedDeliveryLabel ===
                'Current Location'
                  ? colors.lightest
                  : colors.icons,
              borderRadius: 15,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              elevation: 2,
            }}
            style={{borderRadius: 15}}
            titleStyle={[
              styles.header_topDrawerTitleText,
              {
                fontFamily:
                  this.props.generalStore.selectedDeliveryLabel ===
                  'Current Location'
                    ? 'ProductSans-Bold'
                    : 'ProductSans-Light',
                color:
                  this.props.generalStore.selectedDeliveryLabel ===
                  'Current Location'
                    ? colors.primary
                    : colors.text_primary,
              },
            ]}
            subtitle={
              !this.props.generalStore.addressLoading &&
              this.props.generalStore.selectedDeliveryLabel ===
                'Current Location'
                ? this.props.generalStore.currentLocationDetails
                : null
            }
            leftIcon={<Icon name="map-pin" color={colors.primary} />}
            chevron
            onPress={() => {
              this.props.generalStore.setCurrentLocation().then(() => {
                this.props.shopStore.getStoreList({
                  currentLocationGeohash: this.props.generalStore
                    .currentLocationGeohash,
                  locationCoordinates: this.props.generalStore.currentLocation,
                });
              });
              this.hideLocationMenu();
            }}
          />
        </View>

        {this.props.generalStore.userDetails.addresses && (
          <View
            style={{
              borderRadius: 15,
              marginVertical: 5,
              marginHorizontal: 10,
            }}>
            <ListItem
              activeOpacity={0.95}
              title="Last Delivery Location"
              containerStyle={{
                backgroundColor:
                  this.props.generalStore.selectedDeliveryLabel ===
                  'Last Delivery Location'
                    ? colors.lightest
                    : colors.icons,
                borderRadius: 15,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                elevation: 2,
              }}
              style={{borderRadius: 15}}
              titleStyle={[
                styles.header_topDrawerTitleText,
                {
                  fontFamily:
                    this.props.generalStore.selectedDeliveryLabel ===
                    'Last Delivery Location'
                      ? 'ProductSans-Bold'
                      : 'ProductSans-Light',
                  color:
                    this.props.generalStore.selectedDeliveryLabel ===
                    'Last Delivery Location'
                      ? colors.primary
                      : colors.text_primary,
                },
              ]}
              subtitle={
                this.props.generalStore.userDetails?.addresses
                  ? this.props.generalStore.userDetails?.addresses?.Home
                      ?.address
                  : null
              }
              subtitleStyle={styles.subtitleStyle}
              leftIcon={<Icon name="navigation" color={colors.primary} />}
              chevron
              onPress={() => {
                this.props.generalStore.setLastDeliveryLocation().then(() => {
                  this.props.shopStore.getStoreList({
                    currentLocationGeohash: this.props.generalStore
                      .currentLocationGeohash,
                    locationCoordinates: this.props.generalStore
                      .currentLocation,
                  });
                });
                this.hideLocationMenu();
              }}
            />
          </View>
        )}

        <View
          style={{
            marginHorizontal: 10,
            marginTop: 5,
            marginBottom: 10,
          }}>
          <ListItem
            activeOpacity={0.95}
            title="Set Location"
            containerStyle={{
              backgroundColor:
                this.props.generalStore.selectedDeliveryLabel === 'Set Location'
                  ? colors.lightest
                  : colors.icons,
              borderRadius: 15,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              elevation: 2,
            }}
            style={{borderRadius: 15}}
            titleStyle={[
              styles.header_topDrawerTitleText,
              {
                fontFamily:
                  this.props.generalStore.selectedDeliveryLabel ===
                  'Set Location'
                    ? 'ProductSans-Bold'
                    : 'ProductSans-Light',
                color:
                  this.props.generalStore.selectedDeliveryLabel ===
                  'Set Location'
                    ? colors.primary
                    : colors.text_primary,
              },
            ]}
            subtitle={
              !this.props.generalStore.addressLoading &&
              this.props.generalStore.selectedDeliveryLabel === 'Set Location'
                ? this.props.generalStore.currentLocationDetails
                : null
            }
            leftIcon={<Icon name="map" color={colors.primary} />}
            chevron
            onPress={() => {
              navigation.navigate('Set Location', {checkout: false});
              this.hideLocationMenu();
            }}
          />
        </View>
      </Animatable.View>
    );
  };

  Overlay = () => {
    return (
      <Animatable.View
        ref={(overlay) => (this.overlay = overlay)}
        useNativeDriver
        duration={200}
        style={{
          position: 'absolute',
          height: Dimensions.get('window').height + 400,
          width: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0,
          backgroundColor: '#000',
        }}>
        {this.state.locationMenuOpen && (
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => this.hideLocationMenu()}
          />
        )}
      </Animatable.View>
    );
  };

  revealLocationMenu() {
    this.setState({locationMenuOpen: true}, () => {
      this.drawer.animate('slideIn');
      this.overlay.animate('fadeInOverlay');
    });
  }

  hideLocationMenu() {
    this.drawer.animate('slideOut');
    this.overlay.animate('fadeOutOverlay').then(() => {
      this.setState({locationMenuOpen: false});
    });
  }

  render() {
    const {locationMenuOpen} = this.state;
    const {deliverToText} = this;

    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            marginTop: pixelsFromTop,
          }}>
          <MainTab />
        </View>

        {locationMenuOpen && <this.Overlay />}

        <this.SlideDownDrawer />

        <Header
          placement={Platform.OS === 'ios' ? 'center' : 'left'}
          leftComponent={this.menuButton}
          centerComponent={this.centerComponent({deliverToText})}
          rightComponent={this.rightComponent({
            cartQuantity: this.props.shopStore.totalCartItemQuantity,
          })}
          statusBarProps={{
            barStyle: 'light-content',
            backgroundColor: colors.statusBar,
            translucent: true,
            animated: true,
          }}
          containerStyle={styles.header}
          leftContainerStyle={{flex: 0}}
          rightContainerStyle={{flex: 0}}
          centerContainerStyle={{
            flex: 3,
            paddingHorizontal: 20,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  header: {
    backgroundColor: colors.primary,
    justifyContent: 'space-around',
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    zIndex: 1,
  },
  buttonContainer: {
    borderRadius: 24,
    color: '#fff',
  },
  header_titleText: {
    fontSize: 19,
    color: colors.icons,
  },
  listTitleText: {
    fontSize: 22,
    fontFamily: 'ProductSans-Regular',
    color: colors.text_primary,
    marginVertical: 10,
  },
  header_topDrawerTitleText: {
    fontSize: 19,
  },
  subtitleStyle: {
    fontSize: 14,
    color: colors.text_secondary,
  },
});

export default MainScreen;
