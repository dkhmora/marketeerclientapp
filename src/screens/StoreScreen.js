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
import SlidingCartPanel from '../components/SlidingCartPanel';
import ItemCategoriesTab from '../navigation/ItemCategoriesTab';
import StoreDetailsModal from '../components/StoreDetailsModal';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import BottomSheet from 'reanimated-bottom-sheet';

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
const SLIDING_MENU_INITIAL_HEIGHT = 75 + bottomPadding;
const SLIDING_MENU_EXTENDED_HEIGHT =
  SCREEN_HEIGHT - SLIDING_MENU_INITIAL_HEIGHT;
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

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;
    const {navigation} = this.props;
    const {storeCategoryItems, detailsModal} = this.state;

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        {coverImageUrl && displayImageUrl && (
          <BottomSheet
            ref={(sheetRef) => (this.sheetRef = sheetRef)}
            snapPoints={[0, SCREEN_HEIGHT * 0.9]}
            borderRadius={30}
            initialSnap={0}
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
                elevation: 6,
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
                onPress={() => this.sheetRef.snapTo(1)}
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
            style={{paddingBottom: 75 + bottomPadding}}
          />
        </Animatable.View>

        <SlidingCartPanel
          initialHeight={SLIDING_MENU_INITIAL_HEIGHT}
          extendedHeight={SLIDING_MENU_EXTENDED_HEIGHT}
          navigation={navigation}
        />
      </View>
    );
  }
}

export default StoreScreen;
