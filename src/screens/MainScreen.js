import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {
  Header,
  Text,
  ListItem,
  Button,
  Icon,
  Card,
  Image,
} from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';
import {inject} from 'mobx-react';
import StoreCard from '../components/StoreCard';
import StoreList from '../components/StoreList';

const headerHeight = Platform.OS === 'android' ? 56 : 44;
const pixelsFromTop = getStatusBarHeight() + headerHeight;
@inject('shopStore')
class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLocation: false,
      initialPosition: -200,
      ready: false,
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
      fadeIn: {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 0.35,
        },
      },
      fadeOut: {
        from: {
          opacity: 0.35,
        },
        to: {
          opacity: 0,
        },
      },
    });
  }

  menuIcon = () => {
    const {navigation} = this.props;

    if (navigation) {
      return (
        <Button
          onPress={() => navigation.openDrawer()}
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

  rightComponent = () => {
    const {rightComponent} = this.props;

    if (rightComponent) {
      return <View style={{flex: 1}}></View>;
    }

    return <View style={{flex: 1}}></View>;
  };

  centerComponent = () => {
    const {centerComponent, title} = this.props;
    const {showLocation} = this.state;

    return (
      <TouchableOpacity
        style={{flex: 1, flexDirection: 'row'}}
        onPress={() => {
          this.setState({initialPosition: 0});
          if (!showLocation) {
            this.revealLocationMenu();
          } else {
            this.hideLocationMenu();
          }
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text style={styles.header_titleText}>Deliver To: </Text>
        </View>
      </TouchableOpacity>
    );
  };

  SlideDownDrawer = () => {
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
          subtitle="Test Location"
          subtitleStyle={styles.subtitleStyle}
          leftIcon={<Icon name="map-pin" color={colors.primary} />}
          bottomDivider
          chevron
          onPress={() => console.log('yes')}
        />
        <ListItem
          title="Last Delivery Location"
          titleStyle={styles.header_topDrawerTitleText}
          subtitle="Test Location"
          subtitleStyle={styles.subtitleStyle}
          leftIcon={<Icon name="navigation" color={colors.primary} />}
          bottomDivider
          chevron
          onPress={() => console.log('yes')}
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
          zIndex: -100,
          opacity: 0,
          backgroundColor: '#000',
        }}>
        {this.state.showLocation && (
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => this.hideLocationMenu()}
          />
        )}
      </Animatable.View>
    );
  };

  revealLocationMenu() {
    this.setState({showLocation: true}, () => {
      this.drawer.animate('slideIn');
      this.overlay.animate('fadeIn');
    });
  }

  hideLocationMenu() {
    this.drawer.animate('slideOut');
    this.overlay.animate('fadeOut');

    this.setState({showLocation: false});
  }

  componentDidMount() {
    this.props.shopStore.getShopList().then(() => this.setState({ready: true}));
  }

  render() {
    const {navigation} = this.props;
    const {showLocation, ready} = this.state;
    const dataSource = this.props.shopStore.shopList.slice();
    console.log('yes', dataSource);

    if (ready) {
      return (
        <View style={styles.container}>
          <View
            style={{
              flex: 1,
              marginTop: pixelsFromTop,
              paddingHorizontal: 15,
            }}>
            <Text style={styles.listTitleText}>Stores Delivering To You</Text>
            {dataSource && (
              <FlatList
                data={dataSource}
                renderItem={({item, index}) => (
                  <StoreCard store={item} key={index} />
                )}
                keyExtractor={(item) => item.merchantId}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
          <this.Overlay />
          <this.SlideDownDrawer />
          <Header
            placement={Platform.OS === 'ios' ? 'center' : 'left'}
            leftComponent={this.menuIcon}
            centerComponent={this.centerComponent}
            rightComponent={this.rightComponent}
            statusBarProps={{
              barStyle: 'light-content',
              backgroundColor: 'rgba(0, 0, 0, 0.10)',
              translucent: true,
            }}
            containerStyle={styles.header}
            centerContainerStyle={{
              flex: 3,
            }}
          />
        </View>
      );
    } else {
      return null;
    }
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
