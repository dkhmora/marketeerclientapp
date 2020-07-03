import React, {Component} from 'react';
import {FlatList} from 'react-native';
import {Container, View, Fab, Icon, Button} from 'native-base';
import {observer, inject} from 'mobx-react';
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

  render() {
    const {items, storeName} = this.props.route.params;
    const dataSource = [...items];

    const numColumns = 2;

    return (
      <Container style={{flex: 1}}>
        <View style={{flex: 1}}>
          <FlatList
            data={this.formatData(dataSource, numColumns)}
            numColumns={numColumns}
            renderItem={({item, index}) =>
              item.empty ? (
                <View
                  style={{flex: 1, backgroundColor: 'transparent'}}
                  key={index}
                />
              ) : (
                <ItemCard item={item} storeName={storeName} key={index} />
              )
            }
            keyExtractor={(item, index) => `${item.name}${index.toString()}`}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Container>
    );
  }
}

export default ItemsList;
