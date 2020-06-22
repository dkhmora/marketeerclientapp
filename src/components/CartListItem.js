import React, {Component} from 'react';
import FastImage from 'react-native-fast-image';
import {Card, Text, ListItem} from 'react-native-elements';
import {observable} from 'mobx';
import storage from '@react-native-firebase/storage';
import {View, Image} from 'react-native';
import {observer} from 'mobx-react';
import {styles} from '../../assets/styles';
import {colors} from '../../assets/colors';

@observer
class CartListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: require('../../assets/images/placeholder.jpg'),
    };
  }

  @observable url = null;

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref.getDownloadURL();
    this.setState({url: {uri: link}});
  };

  componentDidMount() {
    if (this.props.item.image) {
      console.log(this.props.item.name, this.props.item.image);
      this.getImage();
    }
  }

  render() {
    const {item} = this.props;
    const {url} = this.state;

    return (
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 8,
        }}>
        <FastImage
          key={item.name}
          source={url}
          style={{
            height: 55,
            width: 55,
            borderColor: colors.primary,
            borderWidth: 1,
            borderRadius: 10,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            paddingHorizontal: 10,
          }}>
          <Text style={{fontFamily: 'ProductSans-Regular', fontSize: 18}}>
            {item.name}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: 'ProductSans-Light',
              fontSize: 14,
              color: colors.text_secondary,
            }}>
            {item.description}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
          }}>
          <Text
            style={{
              fontFamily: 'ProductSans-Black',
              fontSize: 16,
              color: colors.text_secondary,
            }}>
            ₱ {item.price}
          </Text>
          <Text
            style={{
              color: colors.text_secondary,
              borderBottomColor: colors.divider,
              borderBottomWidth: 1,
              textAlign: 'right',
              width: '100%',
            }}>
            x {item.quantity}
          </Text>
          <Text style={{fontFamily: 'ProductSans-Black', fontSize: 18}}>
            ₱ {item.price * item.quantity}
          </Text>
        </View>
      </View>
    );
  }
}

export default CartListItem;
