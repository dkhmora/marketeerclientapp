import React, {Component} from 'react';
import {Text, Icon} from 'react-native-elements';
import {View, TouchableOpacity} from 'react-native';
import {Card} from 'native-base';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import storage from '@react-native-firebase/storage';
import {observer, inject} from 'mobx-react';
import StoreCategoryCardLoader from './StoreCategoryCardLoader';

@inject('shopStore')
@observer
class StoreCategoryCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: null,
      ready: false,
    };

    this.getImage();
  }

  getImage = async () => {
    const {item} = this.props;
    const imageSource = `/images/store_categories/${item.name}.jpg`;

    const ref = storage().ref(imageSource);
    const link = await ref.getDownloadURL().catch((err) => {
      if (err.code === '[storage/object-not-found]') {
        console.log('No image');
      }
    });

    if (link) {
      this.setState({url: {uri: link}, ready: true});
    } else {
      this.setState({
        url: require('../../assets/images/placeholder.jpg'),
        ready: true,
      });
    }
  };

  getStores() {
    const {item} = this.props;

    const categoryStores = this.props.shopStore.storeList.filter(
      (store) => store.storeCategory === item.name,
    );

    return categoryStores;
  }

  async displayStores() {
    const storeList = await this.getStores();
    const coverImageUrl = this.state.url;
    const {item} = this.props;

    this.props.navigation.navigate('Category Stores', {
      storeList,
      coverImageUrl,
      categoryDetails: item,
    });
  }

  render() {
    const {item} = this.props;
    const {url, ready} = this.state;

    return (
      <Card
        style={{
          borderRadius: 10,
          height: 100,
          backgroundColor: colors.primary,
        }}>
        {ready ? (
          <TouchableOpacity
            onPress={() => this.displayStores()}
            activeOpacity={0.85}
            style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 7, elevation: 10}}>
              <FastImage source={url} style={{flex: 1, borderRadius: 10}} />
            </View>

            <View
              style={{
                flex: 3,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
              }}>
              <Text
                adjustsFontSizeToFit
                style={{
                  flex: 1,
                  fontSize: 20,
                  color: colors.icons,
                  textAlign: 'center',
                }}>
                {item.name}
              </Text>

              <Icon name="chevron-right" color={colors.icons} />
            </View>
          </TouchableOpacity>
        ) : (
          <View>
            <StoreCategoryCardLoader />
          </View>
        )}
      </Card>
    );
  }
}

export default StoreCategoryCard;
