import React, {Component} from 'react';
import {FlatList} from 'react-native';
import {Container, View, Fab, Icon, Button} from 'native-base';
import {observer, inject} from 'mobx-react';
// Custom Components
import ItemCard from './ItemCard';

@inject('itemsStore')
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
    const {category} = this.props.route.params;
    const {navigation} = this.props;
    let dataSource;

    if (category !== 'All') {
      dataSource = this.props.itemsStore.categoryItems.get(category).slice();
    } else {
      dataSource = this.props.itemsStore.storeItems;
    }

    const numColumns = 2;

    return (
      <Container style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, flex: 1}}>
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
                <ItemCard
                  category={item.category}
                  name={item.name}
                  image={item.image}
                  description={item.description}
                  price={item.price}
                  stock={item.stock}
                  sales={item.sales}
                  unit={item.unit}
                  createdAt={item.createdAt}
                  key={index}
                />
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
