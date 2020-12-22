import React from 'react';
import {View, Text} from 'react-native';
import {colors} from '../../assets/colors';

export default function Pill({title, titleStyle, containerStyle}) {
  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.accent,
        padding: 2,
        paddingHorizontal: 5,
        marginRight: 2,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        ...containerStyle,
      }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: 'ProductSans-Regular',
          color: colors.icons,
          ...titleStyle,
        }}>
        {title}
      </Text>
    </View>
  );
}
