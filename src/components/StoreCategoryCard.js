import React, {Component} from 'react';
import {Text, Icon} from 'react-native-elements';
import {View, TouchableOpacity, Platform} from 'react-native';
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
    const link = await ref.getDownloadURL();

    if (link) {
      this.setState({url: {uri: link}, ready: true});
    } else {
      this.setState({
        url: require('../../assets/images/placeholder.jpg'),
        ready: true,
      });
    }
  };

  async displayStores() {
    const coverImageUrl = this.state.url;
    const {item} = this.props;

    this.props.navigation.navigate('Category Stores', {
      coverImageUrl,
      categoryDetails: item,
    });
  }

  render() {
    const {item} = this.props;
    const {url, ready} = this.state;

    return (
      <View
        style={{
          flex: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          paddingHorizontal: 7.5,
        }}>
        <Card
          style={{
            borderRadius: 10,
            height: 100,
            backgroundColor: colors.primary,
            elevation: 2,
          }}>
          {ready ? (
            <TouchableOpacity
              onPress={() => this.displayStores()}
              activeOpacity={0.85}
              style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 7, elevation: 10}}>
                <FastImage
                  source={url}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>

              <View
                style={{
                  flex: 3.25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingLeft: 10,
                }}>
                <Text
                  adjustsFontSizeToFit
                  allowFontScaling
                  style={{
                    flex: 1,
                    fontSize: Platform.OS === 'ios' ? 17.5 : 20,
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
      </View>
    );
  }
}

export default StoreCategoryCard;
