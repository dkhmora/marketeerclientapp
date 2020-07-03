import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import React from 'react';
import {View} from 'react-native';

function OrderCardLoader() {
  return (
    <Placeholder Animation={Fade}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}>
        <PlaceholderMedia
          style={{
            width: 35,
            height: 35,
            borderRadius: 10,
            marginRight: 10,
          }}
        />

        <View style={{flexDirection: 'column', flex: 1}}>
          <PlaceholderLine width={90} />

          <PlaceholderLine width={90} />
        </View>

        <PlaceholderMedia
          style={{
            width: '15%',
            borderRadius: 10,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 25,
        }}>
        <PlaceholderMedia
          style={{
            width: '75%',
            borderRadius: 24,
          }}
        />
        <PlaceholderMedia
          style={{
            width: '22%',
            borderRadius: 10,
          }}
        />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <PlaceholderLine width={40} />
        <PlaceholderLine width={25} />
      </View>
    </Placeholder>
  );
}

export default OrderCardLoader;
