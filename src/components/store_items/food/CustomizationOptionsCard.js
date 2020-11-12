import {Field, Formik} from 'formik';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, Card, CheckBox, Icon, Text} from 'react-native-elements';
import {colors} from '../../../../assets/colors';
import CustomInput from '../../CustomInput';
import Divider from '../../Divider';
import {Switch} from 'react-native-gesture-handler';

class CustomizationOptionsCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  OptionsList(props) {
    const {options, checkedIcon, uncheckedIcon, onDeleteSelection} = props;

    if (options) {
      return options
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title, 'en', {numeric: true}))
        .map((item, index) => {
          return (
            <View key={item.title}>
              <CheckBox
                center
                title={
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                    }}>
                    <Text style={{flex: 1, fontSize: 16}}>{item.title}</Text>

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
                        +₱{item.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                }
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
      title,
      multipleSelection,
      options,
      onDeleteCustomizationOption,
      onDeleteSelection,
      onAddSelection,
      onChangeMultipleSelection,
    } = this.props;
    const checkedIcon = multipleSelection ? 'check-square' : 'check-circle';
    const uncheckedIcon = multipleSelection ? 'square' : 'circle';
    const {OptionsList} = this;

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

        <OptionsList
          options={options}
          checkedIcon={<Icon name={checkedIcon} color={colors.primary} />}
          uncheckedIcon={<Icon name={uncheckedIcon} color={colors.primary} />}
          onDeleteSelection={(index) => onDeleteSelection(index)}
        />
      </Card>
    );
  }
}

export default CustomizationOptionsCard;
