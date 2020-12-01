import React, {PureComponent} from 'react';
import {Text, View} from 'native-base';
import {Button, Icon} from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {colors} from '../../assets/colors';

class ItemQuantityControlButtons extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      addDisabled: false,
      minusButtonShown: false,
    };
  }

  componentDidUpdate(prevProps) {
    const {
      props: {itemQuantity},
    } = this;

    if (prevProps.itemQuantity !== itemQuantity) {
      this.updateButtons();
    }
  }

  componentDidMount() {
    this.updateButtons();
  }

  updateButtons() {
    const {
      props: {alwaysShowMinusButton, itemQuantity, itemStock},
      state: {minusButtonShown},
    } = this;

    this.setState({addDisabled: itemStock ? itemQuantity >= itemStock : false});

    if (!alwaysShowMinusButton) {
      if (minusButtonShown && itemQuantity <= 0) {
        this.hideMinusButton();
      }

      if (itemQuantity > 0 && !minusButtonShown) {
        this.showMinusButton();
      }
    } else {
      if (!minusButtonShown) {
        this.showMinusButton();
      }
    }
  }

  showMinusButton() {
    this.setState({minusButtonShown: true}, () => {
      this.buttonCounterView?.fadeInRight(200) &&
        this.plusButton?.transformPlusButton(300);
    });
  }

  hideMinusButton() {
    this.setState({minusButtonShown: false}, () => {
      this.buttonCounterView?.fadeOutRight(200) &&
        this.plusButton?.deTransformPlusButton(300);
    });
  }

  render() {
    const {
      props: {
        onIncreaseQuantity,
        onDecreaseQuantity,
        itemQuantity,
        itemStock,
        iconSize,
        persistMinusIcon,
        addButtonContainerStyle,
        minusButtonContainerStyle,
        quantityContainerStyle,
        containerStyle,
      },
      state: {addDisabled, minusDisabled},
    } = this;

    return (
      <View
        style={{
          flexDirection: 'row',
          borderRadius: 100,
          backgroundColor: persistMinusIcon ? colors.icons : 'transparent',
          elevation: persistMinusIcon ? 3 : 0,
          ...containerStyle,
        }}>
        <Animatable.View
          ref={(buttonCounterView) =>
            (this.buttonCounterView = buttonCounterView)
          }
          useNativeDriver
          style={{
            flexDirection: 'row',
            opacity: 0,
            backgroundColor: colors.icons,
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 1.84,
            elevation: 3,
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
              disabled={minusDisabled}
              type="clear"
              color={colors.icons}
              icon={
                <Icon
                  name={
                    !persistMinusIcon && itemQuantity === 1
                      ? 'trash-2'
                      : 'minus'
                  }
                  size={iconSize}
                  color={minusDisabled ? colors.text_secondary : colors.primary}
                />
              }
              containerStyle={[
                {
                  backgroundColor: colors.icons,
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
                minusButtonContainerStyle,
              ]}
            />
          </View>

          <View
            style={{
              backgroundColor: colors.icons,
              height: 40,
              width: 40,
              justifyContent: 'center',
              alignItems: 'center',
              ...quantityContainerStyle,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'ProductSans-Black',
                paddingRight: 4,
                color:
                  itemStock && itemQuantity > itemStock
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
            {
              borderRadius: 24,
              backgroundColor: colors.icons,
              height: 40,
              elevation: 3,
            },
            addButtonContainerStyle,
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
                  size={iconSize}
                />
              }
              containerStyle={[
                {
                  backgroundColor: colors.icons,
                  height: 40,
                  borderRadius: 24,
                  elevation: 3,
                },
                addButtonContainerStyle,
              ]}
            />
          </View>
        </Animatable.View>
      </View>
    );
  }
}

export default ItemQuantityControlButtons;
