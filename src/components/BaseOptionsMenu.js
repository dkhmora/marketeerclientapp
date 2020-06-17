import React, {Component} from 'react';
import {Platform, ActionSheetIOS} from 'react-native';
import {Button, Icon} from 'native-base';
import OptionsMenu from 'react-native-options-menu';

class BaseOptionsMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      optionActions: {},
    };
  }

  componentDidMount() {
    const {options, actions} = this.props;

    if (options.length === actions.length) {
      options.map((option, index) => {
        this.setState((state) => {
          let optionActions = {...state.optionActions};
          optionActions[option] = actions[index];

          return {optionActions};
        });
      });
    } else {
      console.log('Please put an equal number of options and actions');
    }
  }

  openOptions() {
    const {options, destructiveIndex} = this.props;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel'].concat(options),
        destructiveIndex,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else {
          this.state.optionActions[options[buttonIndex - 1]]();
        }
      },
    );
  }

  render() {
    const {options, actions, destructiveIndex} = this.props;
    const {iconStyle} = this.props;

    const OptionsIcon = () => {
      return <Icon name="more" style={{...iconStyle}} />;
    };

    return Platform.OS === 'android' ? (
      <OptionsMenu
        customButton={<OptionsIcon />}
        destructiveIndex={destructiveIndex}
        options={options}
        actions={actions}
      />
    ) : (
      <Button transparent onPress={() => this.openOptions()}>
        <OptionsIcon />
      </Button>
    );
  }
}

export default BaseOptionsMenu;
