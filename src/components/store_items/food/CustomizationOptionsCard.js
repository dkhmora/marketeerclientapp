import React, {Component} from 'react';
import {View} from 'react-native';
import {Card, CheckBox, Icon, Text} from 'react-native-elements';
import {colors} from '../../../../assets/colors';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx';

@inject('shopStore')
@observer
class CustomizationOptionsCard extends Component {
  constructor(props) {
    super(props);

    const {selectedSelections, title} = this.props;

    this.state = {
      selectedSelections:
        selectedSelections !== undefined ? selectedSelections : {},
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      const {
        props: {onSelectionChanged, title},
      } = this;

      onSelectionChanged(this.state.selectedSelections);
    }
  }

  onSelectionPress(selection) {
    const {
      props: {multipleSelection, selections},
      state: {selectedSelections},
    } = this;

    if (selection && multipleSelection) {
      let tempSelectedSelections = JSON.parse(
        JSON.stringify(selectedSelections),
      );

      if (tempSelectedSelections?.[selection.title] !== undefined) {
        delete tempSelectedSelections[selection.title];
      } else {
        tempSelectedSelections[selection.title] = selection.price;
      }

      this.setState({selectedSelections: tempSelectedSelections});
    } else {
      this.setState({selectedSelections: {[selection.title]: selection.price}});
    }
  }

  SelectionsList({
    checkedIcon,
    uncheckedIcon,
    selections,
    onSelectionPress,
    selectedSelections,
  }) {
    if (selections) {
      return selections
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title, 'en', {numeric: true}))
        .map((selection, index) => {
          return (
            <View key={`${selection.title}${index}`}>
              <CheckBox
                center
                onPress={() => onSelectionPress(selection)}
                title={
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                    }}>
                    <Text style={{flex: 1, fontSize: 16}}>
                      {selection.title}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginRight: -10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'ProductSans-Bold',
                          textAlign: 'center',
                        }}>
                        +₱{selection.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                }
                checked={selectedSelections?.[selection.title] !== undefined}
                checkedIcon={checkedIcon}
                uncheckedIcon={uncheckedIcon}
                containerStyle={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingBottom: 0,
                  paddingTop: 0,
                  borderRadius: 0,
                  backgroundColor: colors.icons,
                  paddingHorizontal: 5,
                  marginRight: 0,
                  marginLeft: 0,
                  borderWidth: 0,
                }}
              />
            </View>
          );
        });
    }
  }

  render() {
    const {
      onSelectionPress,
      props: {title, multipleSelection, selections},
      state: {selectedSelections},
    } = this;
    const checkedIcon = multipleSelection ? 'check-square' : 'check-circle';
    const uncheckedIcon = multipleSelection ? 'square' : 'circle';

    return (
      <Card
        containerStyle={{
          paddingBottom: 10,
          paddingTop: 10,
          marginLeft: 0,
          marginRight: 0,
          borderRadius: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: 'ProductSans-Bold',
              marginBottom: 10,
              flex: 1,
            }}>
            {title}
          </Text>

          {!multipleSelection && (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.accent,
                borderRadius: 30,
                paddingVertical: 3,
                paddingHorizontal: 5,
                elevation: 2,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.icons,
                }}>
                Required
              </Text>
            </View>
          )}
        </View>

        <this.SelectionsList
          selections={selections}
          checkedIcon={<Icon name={checkedIcon} color={colors.primary} />}
          uncheckedIcon={<Icon name={uncheckedIcon} color={colors.primary} />}
          onSelectionPress={onSelectionPress.bind(this)}
          selectedSelections={selectedSelections}
        />
      </Card>
    );
  }
}

export default CustomizationOptionsCard;
