import React, {Component} from 'react';
import {FlatList, View} from 'react-native';
import {observer} from 'mobx-react';
// Custom Components
import ItemCard from './ItemCard';
import DeviceInfo from 'react-native-device-info';

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
        this.flatList.scrollToOffset({animated: true, offset: 0});
      },
    );
  }

  componentWillUnmount() {
    this.unsubscribeTabPress && this.unsubscribeTabPress();
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
        storeId={this.props.route.params.storeId}
        key={item.itemId}
      />
    );

  render() {
    const {items} = this.props.route.params;
    const dataSource = [...items];

    const isTablet = DeviceInfo.isTablet();
    const numColumns = isTablet ? 3 : 2;

    return (
      <FlatList
        style={{flex: 1, paddingHorizontal: 5}}
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
