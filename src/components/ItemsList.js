import React, {Component} from 'react';
import {FlatList, View} from 'react-native';
import {observer} from 'mobx-react';
// Custom Components
import ItemCard from './ItemCard';
@observer
class ItemsList extends Component {
  constructor(props) {
    super(props);
  }

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

  renderItem = ({item, index}) =>
    item.empty ? (
      <View
        style={{flex: 1, backgroundColor: 'transparent'}}
        key={item.itemId}
      />
    ) : (
      <ItemCard
        item={item}
        merchantId={this.props.route.params.merchantId}
        key={item.itemId}
      />
    );

  render() {
    const {items} = this.props.route.params;
    const dataSource = [...items];

    const numColumns = 2;

    return (
      <View style={{flex: 1}}>
        <FlatList
          data={this.formatData(dataSource, numColumns)}
          numColumns={numColumns}
          initialNumToRender={10}
          maxToRenderPerBatch={4}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `${item.itemId}`}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

export default ItemsList;
