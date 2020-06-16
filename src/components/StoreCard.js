import React, {Component} from 'react';
import {Card, Image, Text} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import FastImage from 'react-native-fast-image';
import {View} from 'react-native';
import {CardItem} from 'native-base';

class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: null,
    };
  }

  getImage = async () => {
    const image = this.props.store.displayImage;

    const ref = storage().ref(image);
    const url = await ref.getDownloadURL();

    this.setState({url});
  };

  componentDidMount() {
    this.getImage();
  }

  render() {
    const {store} = this.props;
    const {url} = this.state;

    console.log('store', store);

    return (
      <Card containerStyle={{padding: 0, borderRadius: 5, elevation: 5}}>
        {{url} && (
          <View>
            <FastImage
              source={{uri: url}}
              style={{
                height: 200,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
              resizeMode={FastImage.resizeMode.center}
            />
          </View>
        )}
        <CardItem
          style={{
            flexDirection: 'column',
            width: '100%',
            height: 100,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            position: 'relative',
            bottom: 5,
          }}>
          <Text>{store.storeName}</Text>
          <Text>{store.storeDescription}</Text>
          <Text>{store.storeCategory}</Text>
          <Text>{store.deliveryDescription}</Text>
        </CardItem>
      </Card>
    );
  }
}

export default StoreCard;
