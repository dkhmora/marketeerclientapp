import React, {Component} from 'react';
import {styles} from '../../assets/styles';
import {colors} from '../../assets/colors';
import {Button, Icon} from 'react-native-elements';

class BackButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Button
        onPress={() => this.props.navigation.goBack()}
        type="clear"
        icon={<Icon name="arrow-left" color={colors.icons} size={30} />}
        buttonStyle={{borderRadius: 30}}
        containerStyle={[
          styles.buttonContainer,
          {
            position: 'absolute',
            left: 10,
            top: '25%',
          },
        ]}
      />
    );
  }
}

export default BackButton;
