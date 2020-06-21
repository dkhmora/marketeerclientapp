import React, {Component} from 'react';
import FastImage from 'react-native-fast-image';
import {Card, Text, ListItem, Image} from 'react-native-elements';
import {observable} from 'mobx';
import storage from '@react-native-firebase/storage';
import {View} from 'react-native';
import {observer} from 'mobx-react';

@observer
class CartListItem extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  getImage = async () => {
    const ref = storage().ref(this.props.item.image);
    const link = await ref.getDownloadURL();
    this.url = {uri: link};
  };

  componentDidMount() {
    if (this.props.item.image) {
      this.getImage();
    } else {
      this.url = require('../../assets/images/placeholder.jpg');
    }
  }

  render() {
    const {item} = this.props;

    return (
      <View>
        <ListItem
          title={item.name}
          leftAvatar={
            <Image source={this.url} style={{height: 30, width: 30}} />
          }
          bottomDivider
        />
      </View>
    );
  }
}

export default CartListItem;
