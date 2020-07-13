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
import SlidingCartPanel from '../components/SlidingCartPanel';
import {SafeAreaView} from 'react-native-safe-area-context';
import ItemCategoriesTab from '../navigation/ItemCategoriesTab';
import StoreDetailsModal from '../components/StoreDetailsModal';

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
@inject('shopStore')
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
        this.props.route.params.store.merchantId,
        this.props.route.params.store.storeName,
      )
      .then(() => {
        this.setState({
          storeCategoryItems: this.props.shopStore.storeCategoryItems.get(
            store.storeName,
          ),
        });
      });
  }

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;
    const {navigation} = this.props;
    const {storeCategoryItems, detailsModal} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        {coverImageUrl && displayImageUrl && (
          <StoreDetailsModal
            isVisible={detailsModal}
            closeModal={() => this.setState({detailsModal: false})}
            store={store}
            coverImageUrl={coverImageUrl}
            displayImageUrl={displayImageUrl}
          />
        )}

        <Animatable.View
          useNativeDriver
          animation="fadeInUp"
          duration={800}
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
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'absolute',
              }}
            />

            <Animatable.View
              animation="fadeInUp"
              useNativeDriver
              duration={800}
              style={{paddingHorizontal: 10}}>
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
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.text_footer,
                  {
                    color: colors.icons,
                    fontSize: 30,
                    width: '80%',
                    paddingHorizontal: 10,
                  },
                ]}>
                {store.storeName}
              </Text>

              <Button
                type="clear"
                onPress={() => this.setState({detailsModal: true})}
                buttonStyle={{borderRadius: 30}}
                containerStyle={[
                  styles.buttonContainer,
                  {marginRight: 5, backgroundColor: '#fff', height: 40},
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
          <ItemCategoriesTab
            storeCategoryItems={storeCategoryItems}
            storeName={store.storeName}
          />
        </Animatable.View>

        {Platform.OS === 'ios' ? (
          <SafeAreaView>
            <SafeAreaView>
              <SlidingCartPanel navigation={navigation} />
            </SafeAreaView>
          </SafeAreaView>
        ) : (
          <SlidingCartPanel navigation={navigation} />
        )}
      </View>
    );
  }
}

export default StoreScreen;
