import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ItemsList from '../components/ItemsList';
import SlidingCartPanel from '../components/SlidingCartPanel';
import {SafeAreaView} from 'react-native-safe-area-context';

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
@inject('shopStore')
@observer
class StoreScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allStoreItems: [],
      ready: false,
    };

    const {store} = this.props.route.params;

    this.props.shopStore
      .setStoreItems(
        this.props.route.params.store.merchantId,
        this.props.route.params.store.storeName,
      )
      .then(() => {
        this.setState({
          allStoreItems: this.props.shopStore.storeCategoryItems
            .get(store.storeName)
            .get('All'),
        });
      });
  }

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;
    const {navigation} = this.props;
    const {allStoreItems} = this.state;

    const ItemTab = createMaterialTopTabNavigator();

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar animated translucent backgroundColor="rgba(0,0,0,0.3)" />

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

        {Platform.OS === 'ios' ? (
          <SafeAreaView>
            <SlidingCartPanel />
          </SafeAreaView>
        ) : (
          <SlidingCartPanel />
        )}
      </View>
    );
  }
}

export default StoreScreen;
