import React, {Component} from 'react';
import {
  Card,
  CardItem,
  Left,
  Body,
  Text,
  Button,
  Right,
  Icon,
  View,
} from 'native-base';
import {Image, ActionSheetIOS, Platform} from 'react-native';
import moment, {ISO_8601} from 'moment';
import storage from '@react-native-firebase/storage';
import {inject, observer} from 'mobx-react';
import {observable} from 'mobx';
import {ScrollView} from 'react-native-gesture-handler';
import BaseOptionsMenu from './BaseOptionsMenu';

@inject('itemsStore')
@inject('authStore')
@observer
class ItemCard extends Component {
  constructor(props) {
    super(props);
  }

  @observable url = null;

  getImage = async () => {
    const ref = storage().ref(this.props.image);
    const link = await ref.getDownloadURL();
    this.url = link;
  };

  handleDelete() {
    const {merchantId} = this.props.authStore;
    const {deleteStoreItem, deleteImage} = this.props.itemsStore;
    const {
      category,
      name,
      image,
      description,
      price,
      stock,
      sales,
      unit,
      createdAt,
    } = this.props;

    deleteStoreItem(
      merchantId,
      category,
      name,
      description,
      unit,
      price,
      stock,
      sales,
      image,
      createdAt,
    ).then(() => deleteImage(image));
  }

  openOptions() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Delete'],
        destructiveIndex: 1,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else {
          this.handleDelete();
        }
      },
    );
  }

  componentDidMount() {
    if (this.props.image) {
      this.getImage();
    }
  }

  render() {
    const {
      name,
      image,
      description,
      price,
      stock,
      sales,
      unit,
      createdAt,
      ...otherProps
    } = this.props;

    const timeStamp = moment(createdAt, ISO_8601).fromNow();

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginHorizontal: 6,
          marginVertical: 3,
        }}>
        <Card
          {...otherProps}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
          }}>
          <CardItem header bordered style={{backgroundColor: '#E91E63'}}>
            <Left>
              <Body>
                <Text style={{color: '#fff'}}>{name}</Text>
                <Text note style={{color: '#ddd'}}>
                  Left Stock: {stock}
                </Text>
              </Body>
            </Left>
            <Right style={{marginLeft: '-50%'}}>
              <BaseOptionsMenu
                destructiveIndex={1}
                iconStyle={{color: '#fff', fontSize: 24}}
                options={['Delete Item']}
                actions={[this.handleDelete.bind(this)]}
              />
            </Right>
          </CardItem>
          <CardItem cardBody>
            {this.url ? (
              <Image
                loadingIndicatorSource={
                  (require('../../assets/placeholder.jpg'), 2)
                }
                source={{uri: this.url}}
                style={{
                  height: 150,
                  width: null,
                  flex: 1,
                  backgroundColor: '#e1e4e8',
                }}
              />
            ) : (
              <Image
                source={require('../../assets/placeholder.jpg')}
                style={{
                  height: 150,
                  width: null,
                  flex: 1,
                  backgroundColor: '#e1e4e8',
                }}
              />
            )}
          </CardItem>
          <CardItem
            bordered
            style={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              position: 'relative',
              bottom: 20,
              elevation: 5,
            }}>
            <Body
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                height: 100,
                flexGrow: 1,
                flexShrink: 1,
              }}>
              <ScrollView style={{flex: 1}}>
                <Text>{description ? description : 'No description'}</Text>
              </ScrollView>
            </Body>
          </CardItem>
          <CardItem bordered style={{bottom: 20, elevation: 5}}>
            <Body
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text>
                ₱{price}/{unit}
              </Text>
            </Body>
          </CardItem>
          <CardItem
            footer
            bordered
            style={{bottom: 20, marginBottom: -20, elevation: 5}}>
            <Body>
              <Text note>Added {timeStamp}</Text>
            </Body>
          </CardItem>
        </Card>
      </View>
    );
  }
}

ItemCard.defaultProps = {
  editable: false,
};

export default ItemCard;
