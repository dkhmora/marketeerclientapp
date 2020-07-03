import React, {Component} from 'react';
import {FlatList, View} from 'react-native';
import StoreCategoryCard from './StoreCategoryCard';
import {Text} from 'react-native-elements';
import {inject, observer} from 'mobx-react';

@inject('shopStore')
@observer
class StoreCategoryList extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.props.shopStore.setStoreCategories();
  }
  render() {
    const {navigation} = this.props;

    if (this.props.shopStore.storeCategories) {
      return (
        <View style={{flex: 1}}>
          <FlatList
            style={{paddingHorizontal: 15}}
            data={this.props.shopStore.storeCategories.slice()}
            renderItem={({item, index}) => (
              <StoreCategoryCard
                item={item}
                navigation={navigation}
                key={index}
              />
            )}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    return (
      <View style={{flex: 1}}>
        <Text>No categories</Text>
      </View>
    );
  }
}

export default StoreCategoryList;
