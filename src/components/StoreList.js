import React, {Component} from 'react';
import StoreCard from './StoreCard';
import {FlatList} from 'react-native';

class StoreList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {storeList} = this.props;

    return (
      <FlatList
        style={{flex: 1}}
        data={storeList}
        renderItem={({item, index}) => {
          <StoreCard store={item} key={index} />;
        }}
        keyExtractor={(item) => `${item.merchantId}`}
      />
    );
  }
}

export default StoreList;
