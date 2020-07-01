import React, {Component} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-elements';
import {inject, observer} from 'mobx-react';

@inject('shopStore')
@observer
class StoreCategoriesScreen extends Component {
  constructor(props) {
    super(props);

    this.props.shopStore.setStoreCategories().then(() => {
      console.log('cats', this.props.shopStore.storeCategories);
    });
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        {this.props.shopStore.storeCategories.map((item, index) => {
          return <Text key={index}>{item.name}</Text>;
        })}
      </View>
    );
  }
}

export default StoreCategoriesScreen;
