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

    this.state = {
      counter: 0,
    };

    Animatable.initializeRegistryWithDefinitions({
      transformPlusButton: {
        from: {borderBottomLeftRadius: 24, borderTopLeftRadius: 24},
        to: {borderBottomLeftRadius: 0, borderTopLeftRadius: 0},
      },
      deTransformPlusButton: {
        from: {borderBottomLeftRadius: 0, borderTopLeftRadius: 0},
        to: {borderBottomLeftRadius: 24, borderTopLeftRadius: 24},
      },
    });
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

  handleIncreaseQuantity() {
    const {counter} = this.state;

    this.setState({counter: counter + 1}, () => {
      this.state.counter === 1 &&
        this.buttonCounterView.fadeInRight(200) &&
        this.plusButton.transformPlusButton(300);
    });
  }

  handleDecreaseQuantity() {
    const {counter} = this.state;

    this.setState({counter: counter - 1}, () => {
      this.state.counter === 0 &&
        this.buttonCounterView.fadeOutRight(200) &&
        this.plusButton.deTransformPlusButton(300);
    });
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
    const {counter} = this.state;

    return (
      <Animatable.View
        useNativeDriver
        animation="fadeInUp"
        duration={350}
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
            <View style={{flex: 1, justifyContent: 'flex-start', padding: 0}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}>
                <View style={{flexDirection: 'column'}}>
                  <Text
                    style={{
                      color: colors.text_secondary,
                      fontFamily: 'ProductSans-Regular',
                    }}>
                    {name}
                  </Text>
                  <Text
                    style={{
                      color: colors.text_primary,
                      fontFamily: 'ProductSans-Black',
                    }}>
                    ₱{price}/{unit}
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.text_secondary,
                    padding: 5,
                    alignItems: 'center',
                  }}>
                  <Text>{stock}</Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      textAlign: 'center',
                      color: colors.text_secondary,
                      fontFamily: 'ProductSans-Light',
                    }}>
                    Left
                  </Text>
                </View>
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              bottom: 10,
              right: 10,
            }}>
            <Animatable.View
              ref={(buttonCounterView) =>
                (this.buttonCounterView = buttonCounterView)
              }
              useNativeDriver
              style={{
                flexDirection: 'row',
                opacity: 0,
                backgroundColor: '#fff',
                borderTopLeftRadius: 24,
                borderBottomLeftRadius: 24,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 1.84,
                elevation: 2,
              }}>
              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 1.84,
                  paddingRight: 4,
                }}>
                <Button
                  onPress={() => this.handleDecreaseQuantity()}
                  type="clear"
                  color={colors.icons}
                  icon={<Icon name="minus" color={colors.primary} />}
                  containerStyle={[
                    styles.buttonContainer,
                    {
                      backgroundColor: '#fff',
                      height: 40,
                      borderRadius: 24,
                      elevation: 3,
                    },
                  ]}
                />
              </View>

              <View
                style={{
                  backgroundColor: '#fff',
                  height: 40,
                  width: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'ProductSans-Black',
                    paddingRight: 4,
                  }}>
                  {counter}
                </Text>
              </View>
            </Animatable.View>
            <Animatable.View
              ref={(plusButton) => (this.plusButton = plusButton)}
              useNativeDriver
              style={[
                styles.buttonContainer,
                {
                  borderRadius: 24,
                  backgroundColor: '#fff',
                  height: 40,
                  elevation: 2,
                },
              ]}>
              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}>
                <Button
                  onPress={() => this.handleIncreaseQuantity()}
                  type="clear"
                  color={colors.icons}
                  icon={<Icon name="plus" color={colors.primary} />}
                  containerStyle={[
                    styles.buttonContainer,
                    {
                      backgroundColor: '#fff',
                      height: 40,
                      borderRadius: 24,
                      elevation: 3,
                    },
                  ]}
                />
              </View>
            </Animatable.View>
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
