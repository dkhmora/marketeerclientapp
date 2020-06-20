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
  ImageBackground,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Item} from 'native-base';
import ItemsList from '../components/ItemsList';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Animated from 'react-native-reanimated';

@inject('shopStore')
@observer
class StoreScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allStoreItems: [],
      ready: false,
      panel: 'up',
    };

    const {store} = this.props.route.params;

    this.props.shopStore
      .setStoreItems(
        this.props.route.params.store.merchantId,
        this.props.route.params.store.storeName,
      )
      .then(() => {
        console.log(store.storeName);
        console.log(
          'yessss',
          store.storeName,
          this.props.shopStore.storeCategoryItems
            .get(store.storeName)
            .get('All'),
        );
        this.setState({
          allStoreItems: this.props.shopStore.storeCategoryItems
            .get(store.storeName)
            .get('All'),
        });
      });
  }

  componentDidMount() {
    this._panel.show({toValue: 65, velocity: 10});
  }

  openPanel() {
    this._panel.show();
  }

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;
    const {navigation} = this.props;
    const {allStoreItems} = this.state;

    const ItemTab = createMaterialTopTabNavigator();
    const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const SLIDING_MENU_INITIAL_HEIGHT = 65;
    const SLIDING_MENU_EXTENDED_HEIGHT =
      SCREEN_HEIGHT - SLIDING_MENU_INITIAL_HEIGHT;

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar translucent backgroundColor="rgba(0,0,0,0.3)" />

        <Animatable.View
          useNativeDriver
          animation="fadeInUp"
          duration={800}
          style={{flex: Platform.OS === 'android' ? 2.5 : 2}}>
          <ImageBackground
            source={{uri: coverImageUrl}}
            style={{
              flex: 1,
              flexDirection: 'row',
              height: 250,
              resizeMode: 'cover',
              justifyContent: 'center',
              paddingTop: STATUS_BAR_HEIGHT,
              paddingBottom: 40 + STATUS_BAR_HEIGHT,
              paddingHorizontal: 5,
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}>
            <Animatable.View
              useNativeDriver
              animation="fadeIn"
              duration={800}
              style={{
                flex: 1,
                height: SCREEN_HEIGHT,
                width: SCREEN_WIDTH,
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,1)',
                position: 'absolute',
              }}
            />
            <Animatable.View
              animation="fadeInUp"
              useNativeDriver
              duration={800}>
              <Button
                onPress={() => navigation.goBack()}
                type="clear"
                color={colors.icons}
                icon={<Icon name="arrow-left" color={colors.primary} />}
                buttonStyle={{borderRadius: 30}}
                containerStyle={[
                  styles.buttonContainer,
                  {marginRight: 5, backgroundColor: '#fff', height: 40},
                ]}
              />
            </Animatable.View>
            <Animatable.Image
              animation="fadeInUp"
              useNativeDriver
              duration={800}
              source={{uri: displayImageUrl}}
              style={{
                height: 75,
                width: 75,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.6)',
              }}
            />
            <Animatable.View
              animation="fadeInUp"
              useNativeDriver
              duration={800}
              style={{flex: 1}}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: '#fff',
                  marginHorizontal: 5,
                  padding: 5,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                }}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  style={[
                    styles.text_footer,
                    {
                      paddingLeft: 5,
                      color: colors.icons,
                      fontSize: 30,
                      width: '80%',
                    },
                  ]}>
                  {store.storeName}
                </Text>
                <Icon
                  name="info"
                  color={colors.icons}
                  style={{color: '#fff'}}
                />
              </TouchableOpacity>
            </Animatable.View>
          </ImageBackground>
        </Animatable.View>

        <Image
          source={require('../../assets/images/logo.png')}
          style={{
            width: 200,
            height: 150,
            resizeMode: 'center',
            position: 'absolute',
            top: '50%',
            left: '25%',
          }}
        />

        <Animatable.View
          animation="fadeInUpBig"
          duration={700}
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
          {allStoreItems.length > 0 && (
            <ItemTab.Navigator>
              <ItemTab.Screen
                name="All"
                component={ItemsList}
                initialParams={{allStoreItems, storeName: store.storeName}}
              />
            </ItemTab.Navigator>
          )}
        </Animatable.View>

        <SlidingUpPanel
          ref={(c) => (this._panel = c)}
          minimumVelocityThreshold={0.6}
          minimumDistanceThreshold={3}
          allowMomentum
          draggableRange={{
            top: SLIDING_MENU_EXTENDED_HEIGHT,
            bottom: SLIDING_MENU_INITIAL_HEIGHT,
          }}
          containerStyle={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.3)',
            elevation: 20,
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              backgroundColor: '#fff',
              paddingTop: 25,
              paddingBottom: 10,
              paddingHorizontal: 15,
            }}>
            <TouchableOpacity
              onPress={() => this._panel.show()}
              style={{position: 'absolute', top: 0, right: 0, left: 0}}>
              <Icon name="chevron-up" color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this._panel.show()}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}>
                  <Image
                    source={require('../../assets/images/logo_cart.png')}
                    style={{
                      height: 35,
                      width: 40,
                      resizeMode: 'center',
                      tintColor: colors.primary,
                      marginRight: 10,
                    }}
                  />
                  <Text style={{fontSize: 17, fontFamily: 'ProductSans-Black'}}>
                    15 Items{' '}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}>
                  <Text
                    style={{
                      textAlignVertical: 'bottom',
                      color: colors.text_secondary,
                      paddingBottom: 3,
                    }}>
                    Subtotal:{' '}
                  </Text>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                      fontSize: 25,
                      fontFamily: 'ProductSans_Black',
                      textAlignVertical: 'bottom',
                    }}>
                    ₱10921
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </SlidingUpPanel>
      </View>
    );
  }
}

export default StoreScreen;
