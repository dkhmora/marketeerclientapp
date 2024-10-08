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
import {getStoreAvailability} from '../util/helpers';

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
    };
  }

  @computed get displayedStoreList() {
    const {categoryName} = this.props;
    const storeList = this.props.shopStore.viewableStoreList.slice();
    let finalList = storeList;

    if (categoryName) {
      finalList = storeList.filter(
        (store) => store.storeCategory === categoryName,
      );
    }

    return finalList.sort((a, b) => {
      const storeAvailability = [
        getStoreAvailability(a.storeHours, a.vacationMode),
        getStoreAvailability(b.storeHours, b.vacationMode),
      ];

      if (storeAvailability[0] === storeAvailability[1]) {
        return 0;
      } else if (!storeAvailability[1]) {
        return -1;
      }

      return 1;
    });
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
        this.flatList &&
          this.flatList.scrollToOffset({animated: true, offset: 0});
      },
    );
  }

  componentWillUnmount() {
    this.unsubscribeTabPress && this.unsubscribeTabPress();
  }

  getInitialStoreList() {
    const {currentLocation} = this.props.generalStore;

    this.setState({refreshing: true}, () => {
      this.props.shopStore.getStoreList(currentLocation).then(() => {
        this.setState({refreshing: false, loading: false});
      });
    });
  }

  onRefresh() {
    this.getInitialStoreList();
  }

  renderItem = ({item, index}) =>
    item.empty ? (
      <View
        style={{flex: 1, backgroundColor: 'transparent'}}
        key={`view${index}`}
      />
    ) : (
      <StoreCard
        store={item}
        navigation={this.props.navigation}
        key={item.storeId}
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
    const {refreshing, loading} = this.state;

    const isTablet = DeviceInfo.isTablet();

    const numOfColumns = isTablet ? 2 : 1;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}>
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          ref={(flatList) => (this.flatList = flatList)}
          style={{paddingHorizontal: 5}}
          contentContainerStyle={{flexGrow: 1}}
          data={this.formatData(this.displayedStoreList, numOfColumns)}
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
          keyExtractor={(item, index) => (item ? item.storeId : index)}
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
