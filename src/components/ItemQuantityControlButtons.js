import React, {PureComponent} from 'react';
import {Text, View} from 'native-base';
import {Button, Icon} from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

class ItemQuantityControlButtons extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      addDisabled,
      onIncreaseQuantity,
      onDecreaseQuantity,
      itemQuantity,
      itemStock,
    } = this.props;

    return (
      <View style={{flexDirection: 'row'}}>
        <Animatable.View
          ref={(buttonCounterView) =>
            (this.buttonCounterView = buttonCounterView)
          }
          useNativeDriver
          style={{
            flexDirection: 'row',
            opacity: 0,
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 1.84,
            elevation: 2,
          }}>
          <View
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 1.84,
              paddingRight: 4,
            }}>
            <Button
              onPress={onDecreaseQuantity}
              type="clear"
              color={colors.icons}
              icon={
                <Icon
                  name={itemQuantity === 1 ? 'trash-2' : 'minus'}
                  color={colors.primary}
                />
              }
              containerStyle={[
                styles.buttonContainer,
                {
                  backgroundColor: '#fff',
                  height: 40,
                  borderRadius: 24,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                },
              ]}
            />
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              height: 40,
              width: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'ProductSans-Black',
                paddingRight: 4,
                color:
                  itemQuantity > itemStock && itemStock
                    ? '#F44336'
                    : colors.text_primary,
              }}>
              {itemQuantity}
            </Text>
          </View>
        </Animatable.View>

        <Animatable.View
          ref={(plusButton) => (this.plusButton = plusButton)}
          useNativeDriver
          style={[
            styles.buttonContainer,
            {
              borderRadius: 24,
              backgroundColor: '#fff',
              height: 40,
              elevation: 2,
            },
          ]}>
          <View
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}>
            <Button
              onPress={onIncreaseQuantity}
              disabled={addDisabled}
              type="clear"
              color={colors.icons}
              icon={
                <Icon
                  name="plus"
                  color={addDisabled ? colors.text_secondary : colors.primary}
                />
              }
              containerStyle={[
                styles.buttonContainer,
                {
                  backgroundColor: '#fff',
                  height: 40,
                  borderRadius: 24,
                  elevation: 3,
                },
              ]}
            />
          </View>
        </Animatable.View>
      </View>
    );
  }
}

export default ItemQuantityControlButtons;
