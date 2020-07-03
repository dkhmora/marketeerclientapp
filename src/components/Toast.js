import {Toast as Toaster} from 'native-base';

const Toast = (props) => {
  Toaster.show({
    text: '',
    type: 'success',
    duration: 2000,
    style: {margin: 20, borderRadius: 16},
    ...props,
  });
};

export default Toast;
