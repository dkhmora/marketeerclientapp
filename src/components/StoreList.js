import React, {Component} from 'react';
import StoreCard from './StoreCard';
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import * as Animatable from 'react-native-animatable';
import {computed} from 'mobx';

@inject('shopStore')
@inject('generalStore')
@observer
class StoreList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      loading: true,
      onEndReachedCalledDuringMomentum: false,
    };
  }

  @computed get lastStoreLowerRange() {
    return this.props.shopStore.storeList.slice(-1)[0].deliveryCoordinates
      .lowerRange;
  }

  componentDidMount() {
    const {categoryName} = this.props;

    if (categoryName) {
      this.getInitialStoreList();
    }
  }

  getInitialStoreList() {
    const {categoryName} = this.props;
    const {currentLocationGeohash, currentLocation} = this.props.generalStore;

    this.setState({refreshing: true});

    this.props.shopStore
      .getStoreList({
        currentLocationGeohash,
        locationCoordinates: currentLocation,
        storeCategory: categoryName,
      })
      .then(() => {
        this.setState({refreshing: false, loading: false});
      });
  }

  retrieveMoreStores() {
    if (
      !this.state.onEndReachedCalledDuringMomentum &&
      this.state.lastVisible >= 1
    ) {
      const {categoryName} = this.props;
      const {currentLocationGeohash, currentLocation} = this.props.generalStore;

      this.setState({refreshing: true, onEndReachedCalledDuringMomentum: true});

      this.props.shopStore
        .getStoreList({
          currentLocationGeohash,
          locationCoordinates: currentLocation,
          storeCategory: categoryName,
          lastVisible: this.lastStoreLowerRange,
        })
        .then(() => {
          this.setState({
            refreshing: false,
            loading: false,
            onEndReachedCalledDuringMomentum: false,
          });
        });
    }
  }

  onRefresh() {
    this.getInitialStoreList();
  }

  renderFooter = () => {
    return (
      <View style={{bottom: 50, width: '100%'}}>
        {this.state.onEndReachedCalledDuringMomentum && (
          <Animatable.View
            animation="slideInUp"
            duration={400}
            useNativeDriver
            style={{
              alignItems: 'center',
              flex: 1,
            }}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{
                backgroundColor: colors.icons,
                borderRadius: 30,
                padding: 5,
                elevation: 5,
              }}
            />
          </Animatable.View>
        )}
      </View>
    );
  };

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
          onMomentumScrollBegin={() => {
            this.state.onEndReachedCalledDuringMomentum = false;
          }}
          onEndReached={() => this.retrieveMoreStores()}
          onEndReachedThreshold={0.01}
          refreshing={this.state.onEndReachedCalledDuringMomentum}
          ListFooterComponent={this.renderFooter}
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
