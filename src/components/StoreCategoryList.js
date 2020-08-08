import React, {Component} from 'react';
import {FlatList, View, RefreshControl, ActivityIndicator} from 'react-native';
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

  renderItem = ({item, index}) => (
    <StoreCategoryCard
      item={item}
      navigation={this.props.navigation}
      key={`${item.name}${index}`}
    />
  );

  render() {
    const {refreshing} = this.state;

    if (this.props.shopStore.storeCategories) {
      return (
        <View style={{flex: 1}}>
          <FlatList
            style={{paddingHorizontal: 15}}
            data={this.props.shopStore.storeCategories.slice()}
            renderItem={this.renderItem}
            refreshControl={
              <RefreshControl
                colors={[colors.primary, colors.dark]}
                refreshing={refreshing}
                onRefresh={this.onRefresh.bind(this)}
              />
            }
            keyExtractor={(store, index) => `${store.name}${index}`}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
}

export default StoreCategoryList;
