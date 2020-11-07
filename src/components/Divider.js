import React, {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';

class Divider extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      />
    );
  }
}

export default Divider;
