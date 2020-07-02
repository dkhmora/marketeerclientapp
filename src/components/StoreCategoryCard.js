import React, {Component} from 'react';
import {Text, Icon} from 'react-native-elements';
import {View, TouchableOpacity} from 'react-native';
import {Card} from 'native-base';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import storage from '@react-native-firebase/storage';

class StoreCategoryCard extends Component {
  constructor(props) {
    super(props);

    this.state = {url: require('../../assets/images/placeholder.jpg')};

    this.getImage();
  }

  getImage = async () => {
    const {item} = this.props;
    const imageSource = `/images/store_categories/${item.name}.jpg`;

    const ref = storage().ref(imageSource);
    const link = await ref.getDownloadURL();

    if (link) {
      this.setState({url: {uri: link}});
    }
  };

  render() {
    const {item} = this.props;
    const {url} = this.state;

    return (
      <Card
        style={{
          borderRadius: 10,
          height: 100,
          backgroundColor: colors.primary,
        }}>
        <TouchableOpacity
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
      </Card>
    );
  }
}

export default StoreCategoryCard;
