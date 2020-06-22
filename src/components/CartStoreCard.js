import React, {Component} from 'react';
import {View} from 'react-native';
import {Card, Text, Image} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import CartListItem from './CartListItem';
import {colors} from '../../assets/colors';
import storage from '@react-native-firebase/storage';
import {observable} from 'mobx';

@inject('generalStore')
@inject('shopStore')
@observer
class CartStoreCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;
  @observable cartItems = this.props.shopStore.storeCartItems[
    this.props.storeName
  ];

  getImage = async (imageRef) => {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();
    this.url = {uri: link};
  };

  componentDidMount() {
    const {storeName} = this.props;
    const storeDetails = this.props.shopStore.getStoreDetails(storeName);
    const displayImage = storeDetails.displayImage;

    if (displayImage) {
      this.getImage(displayImage);
    } else {
      this.url = require('../../assets/images/placeholder.jpg');
    }
  }

  render() {
    const {storeName} = this.props;

    return (
      <Card
        containerStyle={{
          margin: 3,
          borderRadius: 10,
          elevation: 3,
          overflow: 'hidden',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 5,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}>
          <Image
            source={this.url}
            style={{
              height: 30,
              width: 30,
              marginRight: 10,
              borderRadius: 10,
              borderColor: colors.primary,
              borderWidth: 1,
            }}
          />

          <Text style={{fontSize: 16, fontFamily: 'ProductSans-Black'}}>
            {storeName}
          </Text>
        </View>
        <View>
          {this.cartItems.map((item, index) => {
            return <CartListItem item={item} key={index} />;
          })}
        </View>
      </Card>
    );
  }
}

export default CartStoreCard;
