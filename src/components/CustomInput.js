import React, {Component} from 'react';
import {Icon, Input} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

class CustomInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      field: {name, onBlur, onChange, value},
      form: {errors, touched, setFieldTouched, setFieldValue},
      leftIcon,
      type,
      ...inputProps
    } = this.props;

    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    const touch = name.split('.').reduce((o, i) => o?.[i], touched);

    const hasError = error && touch;

    return (
      <Input
        value={type === 'number' && value ? String(value) : value}
        errorMessage={hasError ? error : ''}
        leftIcon={
          leftIcon ? (
            typeof leftIcon === 'string' ? (
              <Icon name={leftIcon} color={colors.primary} size={20} />
            ) : (
              leftIcon
            )
          ) : null
        }
        onChangeText={(text) =>
          type === 'number' && text
            ? setFieldValue(name, Number(text))
            : onChange(name)(text)
        }
        onBlur={() => {
          setFieldTouched(name);
          onBlur(name);
        }}
        {...inputProps}
      />
    );
  }
}

export default CustomInput;
