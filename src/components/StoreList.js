import React, {Component} from 'react';
import StoreCard from './StoreCard';
import {FlatList, View, StyleSheet, RefreshControl} from 'react-native';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';

@inject('shopStore')
@inject('generalStore')
@observer
class StoreList extends Component {
  constructor(props) {
    super(props);

    this.state = {refreshing: false, loading: true};
  }

  componentDidMount() {
    const {categoryName} = this.props;

    if (categoryName) {
      this.getInitialStoreList();
    }
  }

  getInitialStoreList() {
    const {categoryName} = this.props;

    this.setState({refreshing: true});

    this.props.shopStore
      .getStoreList(
        this.props.generalStore.currentLocationGeohash,
        this.props.generalStore.currentLocation,
        categoryName,
      )
      .then(() => {
        this.setState({refreshing: false, loading: false});
      });
  }

  onRefresh() {
    this.getInitialStoreList();
  }

  render() {
    const {categoryName} = this.props;
    const {navigation} = this.props;
    const {refreshing, loading} = this.state;

    let dataSource = [];

    if (!categoryName) {
      dataSource = this.props.shopStore.storeList.slice();
    } else if (categoryName && !loading) {
      dataSource = this.props.shopStore.categoryStoreList[categoryName].slice();
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}>
        <FlatList
          style={{paddingHorizontal: 15}}
          contentContainerStyle={{flexGrow: 1}}
          data={dataSource}
          renderItem={({item, index}) => (
            <View>
              {index === 0 && (
                <Text style={styles.listTitleText}>
                  Stores Delivering To You
                </Text>
              )}
              <StoreCard store={item} key={index} navigation={navigation} />
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  textAlign: 'center',
                  paddingHorizontal: 15,
                }}>
                Sorry, there are no available stores in your area yet. But don't
                worry, we are expanding. Come back and check us out again soon!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              colors={[colors.primary, colors.dark]}
              refreshing={refreshing}
              onRefresh={this.onRefresh.bind(this)}
            />
          }
          keyExtractor={(item) => item.merchantId}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listTitleText: {
    fontSize: 22,
    fontFamily: 'ProductSans-Regular',
    color: colors.text_primary,
    marginVertical: 10,
  },
});

export default StoreList;
