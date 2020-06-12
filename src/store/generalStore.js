import {observable, action} from 'mobx';
import {Platform} from 'react-native';

class generalStore {
  @observable iconPrefix = Platform.OS === 'ios' ? 'ios' : 'md';
}

export default generalStore;
