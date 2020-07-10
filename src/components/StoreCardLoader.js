import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import React from 'react';
import {View} from 'react-native';

function StoreCardLoader() {
  return (
    <Placeholder Animation={Fade}>
      <PlaceholderMedia
        style={{
          width: '100%',
          height: 150,
        }}
      />
      <PlaceholderMedia
        style={{
          position: 'absolute',
          top: 95,
          left: 20,
          width: 80,
          height: 80,
          borderRadius: 8,
        }}
      />
      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          paddingTop: 30,
          paddingHorizontal: 18,
        }}>
        <PlaceholderLine
          width={70}
          height={15}
          style={{
            marginTop: 0,
            marginBottom: 5,
          }}
        />
        <PlaceholderLine width={100} height={9} style={{marginBottom: 5}} />

        <PlaceholderLine width={80} height={9} style={{marginBottom: 10}} />

        <View style={{flexDirection: 'row'}}>
          <PlaceholderMedia
            style={{
              width: 40,
              height: 18,
              borderRadius: 24,
              marginRight: 5,
            }}
          />

          <PlaceholderMedia
            style={{
              width: 80,
              height: 18,
              borderRadius: 24,
            }}
          />
        </View>
      </View>
    </Placeholder>
  );
}

export default StoreCardLoader;
