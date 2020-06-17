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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {observer, inject} from 'mobx-react';
import {Icon, SocialIcon, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Item} from 'native-base';

@inject('shopStore')
@observer
class StoreScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      emailCheck: false,
      secureTextEntry: true,
    };

    this.props.shopStore.setStoreItems(
      this.props.route.params.store.merchantId,
    );
  }

  render() {
    const {store, displayImageUrl, coverImageUrl} = this.props.route.params;
    const {navigation} = this.props;
    const {emailCheck} = this.state;

    const ItemTab = createMaterialTopTabNavigator();

    return (
      <View style={{flex: 1, backgroundColor: colors.text_primary}}>
        <StatusBar translucent backgroundColor="rgba(0,0,0,0.3)" />

        <View style={{flex: 2, marginBottom: -40}}>
          <ImageBackground
            source={{uri: coverImageUrl}}
            style={{
              flex: 1,
              flexDirection: 'row',
              resizeMode: 'cover',
              justifyContent: 'center',
            }}></ImageBackground>
        </View>

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
          duration={500}
          style={styles.footer}></Animatable.View>
      </View>
    );
  }
}

export default StoreScreen;
