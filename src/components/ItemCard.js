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
import * as Animatable from 'react-native-animatable';

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
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        style={{
          flex: 1,
          flexDirection: 'column',
          marginHorizontal: 6,
          marginVertical: 3,
        }}>
        <Card
          {...otherProps}
          style={{
            borderRadius: 10,
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
          </CardItem>
          <CardItem cardBody>
            {this.url ? (
              <Image
                loadingIndicatorSource={
                  (require('../../assets/images/placeholder.jpg'), 2)
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
                source={require('../../assets/images/placeholder.jpg')}
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
              <Text note>+</Text>
            </Body>
          </CardItem>
        </Card>
      </Animatable.View>
    );
  }
}

ItemCard.defaultProps = {
  editable: false,
};

export default ItemCard;
