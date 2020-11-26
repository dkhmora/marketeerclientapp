import React, {PureComponent} from 'react';
import {View} from 'react-native';
import {ListItem, Text} from 'react-native-elements';
import moment from 'moment';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';
import {colors} from '../../../../assets/colors';
import FastImage from 'react-native-fast-image';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import Divider from '../../Divider';
import {CDN_BASE_URL} from '../../util/variables';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

@inject('authStore')
@inject('shopStore')
@observer
class FoodItemCard extends PureComponent {
  constructor(props) {
    super(props);

    const {item} = this.props;

    this.state = {
      url: item.image ? {uri: `${CDN_BASE_URL}${item.image}`} : null,
      imageReady: false,
    };
  }

  @computed get timeStamp() {
    return moment(this.props.item.updatedAt, 'x').fromNow();
  }

  RightElement(props) {
    const {source, imageReady, onImageReady} = props;

    return (
      <View
        style={{
          marginHorizontal: 5,
          elevation: 3,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
        <FastImage
          source={source}
          style={{
            width: 75,
            height: 75,
          }}
          resizeMode={FastImage.resizeMode.contain}
          onLoad={onImageReady}
        />

        {!imageReady && (
          <View style={{position: 'absolute'}}>
            <Placeholder Animation={Fade}>
              <PlaceholderMedia
                style={{
                  backgroundColor: colors.primary,
                  width: 75,
                  height: 75,
                }}
              />
            </Placeholder>
          </View>
        )}
      </View>
    );
  }

  Subtitle(props) {
    const {description, basePrice} = props;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
        <Text style={{color: colors.text_secondary}}>{description}</Text>

        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 13}}>from </Text>
          <Text
            style={{
              color: colors.primary,
              fontSize: 13,
              fontFamily: 'ProductSans-Bold',
            }}>
            ₱{basePrice.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    const {item, navigation, storeId, ...otherProps} = this.props;
    const {url, imageReady} = this.state;
    const {Subtitle, RightElement} = this;

    return (
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate('Food Item Details', {item, storeId})
        }>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            paddingHorizontal: 10,
          }}>
          <ListItem
            title={item.name}
            titleStyle={{fontSize: 18, fontFamily: 'ProductSans-Bold'}}
            subtitle={
              <Subtitle description={item.description} basePrice={item.price} />
            }
            rightElement={
              url ? (
                <RightElement
                  source={url}
                  imageReady={imageReady}
                  onImageReady={() => this.setState({imageReady: true})}
                />
              ) : null
            }
            style={{paddingTop: 1, paddingBottom: 1}}
            containerStyle={{
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 5,
              paddingRight: 5,
            }}
          />

          <Divider />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default FoodItemCard;
