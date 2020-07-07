import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  ActivityIndicator,
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
import Geolocation from '@react-native-community/geolocation';
import geohash from 'ngeohash';
import {computed} from 'mobx';

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
      initialPosition: -200,
      image: '',
      url: '',
    };

    Animatable.initializeRegistryWithDefinitions({
      slideIn: {
        from: {translateY: -pixelsFromTop},
        to: {translateY: pixelsFromTop},
      },
      slideOut: {
        from: {translateY: pixelsFromTop},
        to: {translateY: -pixelsFromTop},
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
    const {deliverToCurrentLocation} = this.props.generalStore;
    const {userDetails} = this.props.generalStore;

    return userDetails.lastDeliveryLocationAddress && !deliverToCurrentLocation
      ? userDetails.lastDeliveryLocationAddress
      : 'Current Location';
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
              style={{width: 30, height: 30, resizeMode: 'center'}}
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
        style={{
          width: '100%',
          backgroundColor: '#fff',
          top: this.state.initialPosition,
          position: 'absolute',
        }}>
        <ListItem
          title="Current Location"
          titleStyle={styles.header_topDrawerTitleText}
          leftIcon={<Icon name="map-pin" color={colors.primary} />}
          bottomDivider
          chevron
          checkmark={
            this.props.generalStore.deliverToCurrentLocation && (
              <Icon name="check" color={colors.primary} />
            )
          }
          onPress={() => {
            this.props.generalStore.setCurrentLocation();
            this.hideLocationMenu();
          }}
        />

        {this.props.generalStore.userDetails.lastDeliveryLocation && (
          <ListItem
            title="Last Delivery Location"
            titleStyle={styles.header_topDrawerTitleText}
            subtitle={
              this.props.generalStore.userDetails.lastDeliveryLocationAddress &&
              this.props.generalStore.userDetails.lastDeliveryLocationAddress
            }
            subtitleStyle={styles.subtitleStyle}
            leftIcon={<Icon name="navigation" color={colors.primary} />}
            bottomDivider
            chevron
            checkmark={
              !this.props.generalStore.deliverToCurrentLocation && (
                <Icon name="check" color={colors.primary} />
              )
            }
            onPress={() => {
              this.props.generalStore.setLastDeliveryLocation();
              this.hideLocationMenu();
            }}
          />
        )}

        <ListItem
          title="Edit Current Location"
          titleStyle={styles.header_topDrawerTitleText}
          leftIcon={<Icon name="map" color={colors.primary} />}
          bottomDivider
          chevron
          onPress={() => {
            navigation.navigate('Set Location', {checkout: false});
            this.hideLocationMenu();
          }}
        />
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
    const {appReady} = this.props.generalStore;
    const {deliverToText} = this;

    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            marginTop: pixelsFromTop,
          }}>
          {appReady ? (
            <MainTab />
          ) : (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
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
          centerContainerStyle={{
            flex: 3,
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
