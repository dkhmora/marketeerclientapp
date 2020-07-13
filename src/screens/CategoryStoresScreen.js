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
import ItemTabs from '../navigation/ItemCategoriesTab';
import StoreList from '../components/StoreList';

const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

@inject('shopStore')
@observer
class CategoryStoresScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {storeList, coverImageUrl, categoryDetails} = this.props.route.params;
    const {navigation} = this.props;

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar animated translucent backgroundColor={colors.statusBar} />

        <Animatable.View
          useNativeDriver
          animation="fadeInUp"
          duration={800}
          style={{flexDirection: 'row'}}>
          <ImageBackground
            source={coverImageUrl}
            style={{
              flex: 1,
              flexDirection: 'row',
              height: 230,
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
                backgroundColor: 'rgba(0,0,0,0.5)',
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

            <Animatable.View
              animation="fadeInUp"
              useNativeDriver
              duration={800}
              style={{flex: 1, justifyContent: 'center'}}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={2}
                style={[
                  styles.text_footer,
                  {
                    paddingLeft: 5,
                    color: colors.icons,
                    fontSize: 30,
                  },
                ]}>
                {categoryDetails.name}
              </Text>

              {categoryDetails.description && (
                <View style={{flex: 1, marginTop: 16}}>
                  <Text
                    adjustsFontSizeToFit
                    style={[
                      styles.text_footer,
                      {
                        paddingLeft: 5,
                        color: colors.icons,
                        fontSize: 20,
                        flexShrink: 1,
                      },
                    ]}>
                    {categoryDetails.description}
                  </Text>
                </View>
              )}
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
          <StoreList dataSource={storeList} component navigation={navigation} />
        </Animatable.View>
      </View>
    );
  }
}

export default CategoryStoresScreen;
