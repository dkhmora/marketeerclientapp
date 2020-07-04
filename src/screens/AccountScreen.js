import React, {Component} from 'react';
import BaseHeader from '../components/BaseHeader';
import {View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Card} from 'native-base';
import {Text} from 'react-native-elements';

@inject('authStore')
@observer
class AccountScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {navigation} = this.props;
    const {userName} = this.props.authStore;

    return (
      <View style={{flex: 1}}>
        <BaseHeader title={userName} backButton navigation={navigation} />

        <Card>
          <View>
            <Text>{userName}</Text>
          </View>
        </Card>
      </View>
    );
  }
}

export default AccountScreen;
