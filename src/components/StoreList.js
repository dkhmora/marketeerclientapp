import React, {Component} from 'react';
import StoreCard from './StoreCard';
import {FlatList, View, StyleSheet} from 'react-native';
import {Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {inject, observer} from 'mobx-react';

@inject('shopStore')
@observer
class StoreList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const dataSource = this.props.shopStore.storeList.slice();
    const {navigation} = this.props;

    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
        }}>
        {dataSource && (
          <FlatList
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
            keyExtractor={(item) => item.merchantId}
            showsVerticalScrollIndicator={false}
          />
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
