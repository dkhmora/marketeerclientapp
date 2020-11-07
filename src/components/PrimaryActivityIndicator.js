import React, {PureComponent} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {colors} from '../../assets/colors';

class PrimaryActivityIndicator extends PureComponent {
  render() {
    const {style} = this.props;

    return (
      <View
        style={{
          ...style,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 15,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
}

export default PrimaryActivityIndicator;
