import React, {PureComponent} from 'react';
import {Platform, ActionSheetIOS} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import OptionsMenu from 'react-native-options-menu';
import {colors} from '../../assets/colors';

class BaseOptionsMenu extends PureComponent {
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
    const {options, actions, destructiveIndex, optionsIcon} = this.props;
    const {iconStyle} = this.props;

    const ActionSheetButton = () => {
      return (
        <Button
          type="clear"
          icon={
            <Icon
              name={optionsIcon ? optionsIcon : 'more-vertical'}
              color={colors.icons}
              style={{...iconStyle}}
            />
          }
          color={colors.icons}
          containerStyle={{borderRadius: 24}}
          onPress={() => this.openOptions()}
        />
      );
    };

    return Platform.OS === 'android' ? (
      <OptionsMenu
        customButton={
          <Icon
            name={optionsIcon ? optionsIcon : 'more-vertical'}
            color={colors.icons}
            style={{...iconStyle}}
          />
        }
        destructiveIndex={destructiveIndex}
        options={options}
        actions={actions}
      />
    ) : (
      <ActionSheetButton />
    );
  }
}

export default BaseOptionsMenu;
