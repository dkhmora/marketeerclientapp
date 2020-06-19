import React, {Component} from 'react';
import {Card, CardItem, Left, Body, Text, Right, View} from 'native-base';
import {Image, ActionSheetIOS, Platform} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import moment, {ISO_8601} from 'moment';
import storage from '@react-native-firebase/storage';
import {inject, observer} from 'mobx-react';
import {observable} from 'mobx';
import {ScrollView} from 'react-native-gesture-handler';
import BaseOptionsMenu from './BaseOptionsMenu';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

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
        useNativeDriver
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
          <CardItem
            header
            bordered
            style={{
              backgroundColor: '#fff',
            }}>
            <View style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}>
                <View style={{flexDirection: 'column'}}>
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    {name}
                  </Text>
                  <Text
                    style={{
                      color: colors.text_secondary,
                      fontFamily: 'ProductSans-Regular',
                    }}>
                    ₱{price}/{unit}
                  </Text>
                </View>
                <Text
                  note
                  style={{
                    color: colors.text_secondary,
                    fontFamily: 'ProductSans-Light',
                  }}>
                  Left Stock: {stock}
                </Text>
              </View>
            </View>
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
          <View style={{position: 'absolute', bottom: 10, right: 10}}>
            <Button
              type="clear"
              color={colors.icons}
              icon={<Icon name="plus" color={colors.primary} />}
              containerStyle={[
                styles.buttonContainer,
                {
                  borderRadius: 24,
                  backgroundColor: '#fff',
                  height: 40,
                },
              ]}
            />
          </View>
        </Card>
      </Animatable.View>
    );
  }
}

ItemCard.defaultProps = {
  editable: false,
};

export default ItemCard;
