import React, {Component} from 'react';
import {FlatList, View, RefreshControl} from 'react-native';
import StoreCategoryCard from './StoreCategoryCard';
import {Text} from 'react-native-elements';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';

@inject('shopStore')
@observer
class StoreCategoryList extends Component {
  constructor(props) {
    super(props);
    this.state = {refreshing: true};
  }

  componentDidMount() {
    this.props.shopStore.setStoreCategories().then(() => {
      this.setState({refreshing: false});
    });
  }

  onRefresh() {
    this.setState({refreshing: true});

    this.props.shopStore.setStoreCategories().then(() => {
      this.setState({refreshing: false});
    });
  }

  render() {
    const {navigation} = this.props;
    const {refreshing} = this.state;

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
            refreshControl={
              <RefreshControl
                colors={[colors.primary, colors.dark]}
                refreshing={refreshing}
                onRefresh={this.onRefresh.bind(this)}
              />
            }
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
