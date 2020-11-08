import React, {Component} from 'react';
import {Text, Icon} from 'react-native-elements';
import {View, TouchableOpacity, Platform} from 'react-native';
import {Card} from 'native-base';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';
import {observer, inject} from 'mobx-react';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import {CDN_BASE_URL} from './util/variables';

@inject('shopStore')
@observer
class StoreCategoryCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      imageViewWidth: null,
    };
  }

  async displayStores(imageUrl) {
    const {item} = this.props;

    this.props.navigation.navigate('Category Stores', {
      coverImageUrl: imageUrl,
      categoryDetails: item,
    });
  }

  render() {
    const {item} = this.props;
    const {ready, imageViewWidth} = this.state;
    const imageUrl = {
      uri: `${CDN_BASE_URL}/images/store_categories/${item.name}.jpg`,
    };

    return (
      <View
        style={{
          flex: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          paddingHorizontal: 5,
        }}>
        <Card
          style={{
            borderRadius: 10,
            height: 100,
            backgroundColor: colors.primary,
            elevation: 2,
          }}>
          <TouchableOpacity
            onPress={() => this.displayStores(imageUrl)}
            activeOpacity={0.85}
            style={{flex: 1, flexDirection: 'row'}}>
            <View
              style={{flex: 7, elevation: 10}}
              onLayout={(event) => {
                const {width} = event.nativeEvent.layout;
                this.setState({imageViewWidth: width});
              }}>
              <FastImage
                source={imageUrl}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  opacity: ready ? 1 : 0,
                }}
                onLoad={() => this.setState({ready: true})}
              />

              {!ready && (
                <View style={{position: 'absolute'}}>
                  <Placeholder Animation={Fade}>
                    <PlaceholderMedia
                      style={{
                        height: 100,
                        width: imageViewWidth,
                        borderRadius: 10,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </Placeholder>
                </View>
              )}
            </View>

            <View
              style={{
                flex: 3.25,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 10,
              }}>
              <Text
                adjustsFontSizeToFit
                allowFontScaling
                style={{
                  flex: 1,
                  fontSize: Platform.OS === 'ios' ? 17.5 : 20,
                  color: colors.icons,
                  textAlign: 'center',
                }}>
                {item.name}
              </Text>

              <Icon name="chevron-right" color={colors.icons} />
            </View>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }
}

export default StoreCategoryCard;
