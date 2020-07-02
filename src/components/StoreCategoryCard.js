import React, {Component} from 'react';
import {Text} from 'react-native-elements';
import {View} from 'react-native';
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
          flexDirection: 'row',
          backgroundColor: colors.primary,
        }}>
        <View style={{flex: 3, elevation: 10}}>
          <FastImage source={url} style={{flex: 1, borderRadius: 10}} />
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: 10,
          }}>
          <Text style={{fontSize: 18, color: colors.icons}}>{item.name}</Text>
        </View>
      </Card>
    );
  }
}

export default StoreCategoryCard;
