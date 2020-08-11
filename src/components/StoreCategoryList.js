import React, {Component} from 'react';
import {FlatList, View, RefreshControl, ActivityIndicator} from 'react-native';
import StoreCategoryCard from './StoreCategoryCard';
import {inject, observer} from 'mobx-react';
import {colors} from '../../assets/colors';
import DeviceInfo from 'react-native-device-info';

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

  formatData(data, numColumns) {
    const numberOfFullRows = Math.floor(data.length / numColumns);

    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      data.push({key: `blank-${numberOfElementsLastRow}`, empty: true});
      numberOfElementsLastRow += 1;
    }

    return data;
  }

  render() {
    const {refreshing} = this.state;
    const dataSource = this.props.shopStore.storeCategories.slice();
    const isTablet = DeviceInfo.isTablet();

    const numOfColumns = isTablet ? 2 : 1;

    if (this.props.shopStore.storeCategories) {
      return (
        <View style={{flex: 1}}>
          <FlatList
            style={{paddingHorizontal: 7.5}}
            data={this.formatData(dataSource, numOfColumns)}
            renderItem={this.renderItem}
            numColumns={numOfColumns}
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
