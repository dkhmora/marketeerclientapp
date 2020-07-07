import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import React from 'react';
import {View} from 'react-native';
import {colors} from '../../assets/colors';
import {Text, Icon} from 'react-native-elements';
import {CardItem} from 'native-base';

function ItemCardLoader() {
  return (
    <Placeholder Animation={Fade}>
      <View
        style={{
          backgroundColor: colors.icons,
          paddingHorizontal: 10,
          paddingVertical: 10,
          elevation: 2,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            height: 33,
          }}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <PlaceholderLine height={10} width={50} />
            <PlaceholderLine height={10} width={70} />
          </View>

          <View style={{width: 30}}>
            <Icon name="info" color={colors.text_secondary} />
          </View>
        </View>
      </View>

      <CardItem cardBody style={{marginTop: -10}}>
        <PlaceholderMedia
          style={{
            width: '100%',
            aspectRatio: 1,
          }}
        />
      </CardItem>
    </Placeholder>
  );
}

export default ItemCardLoader;
