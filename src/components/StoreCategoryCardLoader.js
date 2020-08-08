import {Placeholder, PlaceholderMedia, Fade} from 'rn-placeholder';
import React from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {colors} from '../../assets/colors';

function StoreCategoryCardLoader() {
  return (
    <Placeholder Animation={Fade}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 7, flexDirection: 'row', elevation: 10}}>
          <PlaceholderMedia
            style={{
              backgroundColor: colors.primary,
              height: '100%',
              width: '100%',
              borderRadius: 10,
            }}
          />
        </View>
        <View
          style={{
            flex: 3,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
          }}>
          <View
            style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
            <PlaceholderMedia
              style={{
                backgroundColor: colors.primary,
                marginBottom: 10,
                width: '80%',
                height: 15,
                flexShrink: 1,
              }}
            />
            <PlaceholderMedia
              style={{
                backgroundColor: colors.primary,
                marginBottom: 0,
                width: '100%',
                height: 15,
                flexShrink: 1,
              }}
            />
          </View>
          <Icon name="chevron-right" color={colors.icons} />
        </View>
      </View>
    </Placeholder>
  );
}

export default StoreCategoryCardLoader;
