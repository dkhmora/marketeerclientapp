import Toaster from 'react-native-root-toast';
import {colors} from '../../assets/colors';

const Toast = (props) => {
  const backgroundColor =
    props.type === 'danger'
      ? colors.danger
      : props.type === 'info'
      ? colors.info
      : props.type === 'warning'
      ? colors.warning
      : colors.success;

  Toaster.show(props.text, {
    duration: 3000,
    position: Toaster.positions.BOTTOM,
    animation: true,
    hideOnPress: true,
    backgroundColor,
    textColor: colors.icons,
    delay: 0,
    shadow: true,
    containerStyle: {borderRadius: 30},
    ...props,
  });
};

export default Toast;
