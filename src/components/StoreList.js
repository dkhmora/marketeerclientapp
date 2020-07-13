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

    this.state = {refreshing: false};
  }

  onRefresh() {
    this.setState({refreshing: true});

    this.props.shopStore
      .getShopList(
        this.props.generalStore.currentLocationGeohash,
        this.props.generalStore.currentLocation,
      )
      .then(() => {
        this.setState({refreshing: false});
      });
  }

  render() {
    let dataSource = '';

    if (!this.props.component) {
      dataSource = this.props.shopStore.storeList.slice();
    } else {
      dataSource = this.props.dataSource;
    }

    const {navigation} = this.props;
    const {refreshing} = this.state;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}>
        <FlatList
          style={{paddingHorizontal: 15}}
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

        {dataSource.length <= 0 && this.props.generalStore.appReady && (
          <View
            style={{
              position: 'absolute',
              top: '50%',
              bottom: '50%',
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                paddingHorizontal: 15,
              }}>
              We are sorry. There are no stores delivering to your area at the
              moment. Please come back and try again soon!
            </Text>
          </View>
        )}
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
