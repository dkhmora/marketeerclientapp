import React, {Component} from 'react';
import {FlatList, View} from 'react-native';
import {observer} from 'mobx-react';
// Custom Components
import ItemCard from './store_items/basic/ItemCard';
import DeviceInfo from 'react-native-device-info';
import FoodItemCard from './store_items/food/FoodItemCard';

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

  componentDidMount() {
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

  renderItem = ({item, index}) => {
    const {storeType} = this.props.route.params;
    const ItemCardComponent = storeType === 'food' ? FoodItemCard : ItemCard;

    if (item.empty) {
      return (
        <View style={{flex: 1, backgroundColor: 'transparent'}} key={index} />
      );
    }

    return (
      <ItemCardComponent
        item={item}
        navigation={this.props.navigation}
        key={`${item.name}${this.props.route.params.category}`}
      />
    );
  };

  render() {
    const {items, storeType} = this.props.route.params;
    const dataSource = [...items];

    const isTablet = DeviceInfo.isTablet();
    const numColumns =
      storeType === 'basic' ? (isTablet ? 3 : 2) : isTablet ? 2 : 1;

    return (
      <FlatList
        style={{flex: 1, paddingHorizontal: 5}}
        contentContainerStyle={{paddingBottom: 60}}
        ref={(flatList) => (this.flatList = flatList)}
        data={this.formatData(dataSource, numColumns)}
        numColumns={numColumns}
        initialNumToRender={10}
        maxToRenderPerBatch={4}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => `${item.itemId}`}
        showsVerticalScrollIndicator={false}
      />
    );
  }
}

export default ItemsList;
