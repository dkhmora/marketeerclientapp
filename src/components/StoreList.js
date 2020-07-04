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
    let dataSource = '';

    if (!this.props.component) {
      dataSource = this.props.route.params.dataSource;
    } else {
      dataSource = this.props.dataSource;
    }

    const {navigation} = this.props;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}>
        {dataSource.length > 0 ? (
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
            keyExtractor={(item) => item.merchantId}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text
            style={{fontSize: 20, textAlign: 'center', paddingHorizontal: 15}}>
            We are sorry. There are no stores delivering to your area at the
            moment. Please come back and try again soon!
          </Text>
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
