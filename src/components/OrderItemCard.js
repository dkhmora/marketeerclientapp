import React, {Component} from 'react';
import {Card, CardItem, Left, Body, Right, Text, View, H3} from 'native-base';
import {Image} from 'react-native';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import storage from '@react-native-firebase/storage';

@observer
class OrderItemCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  getImage = async () => {
    const ref = storage().ref(this.props.image);
    const link = await ref.getDownloadURL();
    this.url = link;
  };

  componentDidMount() {
    if (this.props.image) {
      this.getImage();
    }
  }

  render() {
    const {
      name,
      image,
      price,
      unit,
      quantity,
      createdAt,
      ...otherProps
    } = this.props;

    return (
      <View>
        <CardItem bordered>
          <Left>
            {this.url ? (
              <Image
                source={{uri: this.url}}
                style={{
                  height: 80,
                  aspectRatio: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#BDBDBD',
                  width: null,
                  backgroundColor: '#e1e4e8',
                }}
              />
            ) : (
              <Image
                source={require('../../assets/images/placeholder.jpg')}
                style={{
                  height: 80,
                  aspectRatio: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#BDBDBD',
                  width: null,
                  backgroundColor: '#e1e4e8',
                }}
              />
            )}
          </Left>
          <Body
            style={{
              justifyContent: 'center',
              marginHorizontal: '-30%',
            }}>
            <Text>{name}</Text>
          </Body>
          <Right>
            <Text>₱{price}</Text>
            <Text note>x {quantity}</Text>
          </Right>
        </CardItem>
      </View>
    );
  }
}

export default OrderItemCard;
