import React, {Component} from 'react';
import StoreCard from './StoreCard';
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';
import * as Animatable from 'react-native-animatable';
import {computed, when} from 'mobx';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';

const inset = initialWindowMetrics && initialWindowMetrics.insets;
const bottomPadding = Platform.OS === 'ios' ? inset.bottom : 0;
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
      currentLocation: null,
      currentLocationGeohash: null,
    };
  }

  @computed get lastStoreLowerRange() {
    return this.props.shopStore.storeList.slice(-1)[0].deliveryCoordinates
      .lowerRange;
  }

  componentDidMount() {
    when(
      () =>
        this.props.generalStore.currentLocation &&
        this.props.generalStore.currentLocationGeohash,
      () => {
        this.getInitialStoreList();
      },
    );

    if (
      this.props.generalStore.appReady &&
      this.props.generalStore.locationError
    ) {
      this.props.generalStore.locationError = false;
      this.props.navigation.navigate('Set Location', {checkout: false});
    }

    this.unsubscribeTabPress = this.props.navigation.addListener(
      'tabPress',
      (e) => {
        this.flatList.scrollToOffset({animated: true, offset: 0});
      },
    );
  }

  componentWillUnmount() {
    this.unsubscribeTabPress && this.unsubscribeTabPress();
  }

  getInitialStoreList() {
    const {categoryName} = this.props;
    const {currentLocationGeohash, currentLocation} = this.props.generalStore;

    this.setState(
      {refreshing: true, currentLocationGeohash, currentLocation},
      () => {
        this.props.shopStore
          .getStoreList({
            currentLocationGeohash: this.state.currentLocationGeohash,
            locationCoordinates: this.state.currentLocation,
            storeCategory: categoryName,
          })
          .then(() => {
            this.setState({refreshing: false, loading: false});
          });
      },
    );
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
        <View style={{height: bottomPadding}} />
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

  renderItem = ({item, index}) => (
    <StoreCard
      store={item}
      navigation={this.props.navigation}
      key={item.merchantId}
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
    const {categoryName} = this.props;
    const {refreshing, loading} = this.state;

    let dataSource = [];

    if (!loading) {
      if (!categoryName) {
        dataSource = this.props.shopStore.storeList.slice();
      } else {
        dataSource = this.props.shopStore.categoryStoreList[
          categoryName
        ].slice();
      }
    }

    const isTablet = DeviceInfo.isTablet();

    const numOfColumns = isTablet ? 2 : 1;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}>
        <FlatList
          ref={(flatList) => (this.flatList = flatList)}
          style={{paddingHorizontal: 7.5}}
          contentContainerStyle={{flexGrow: 1}}
          data={this.formatData(dataSource, numOfColumns)}
          numColumns={numOfColumns}
          renderItem={this.renderItem}
          ListHeaderComponent={
            <Text style={styles.listTitleText}>Stores Delivering To You</Text>
          }
          ListEmptyComponent={
            !loading && (
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
                  Sorry, there are no available stores in your area yet. But
                  don't worry, we are expanding. Come back and check us out
                  again soon!
                </Text>
              </View>
            )
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
