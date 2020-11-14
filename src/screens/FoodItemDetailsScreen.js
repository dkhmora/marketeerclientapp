import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import StickyParallaxHeader from 'react-native-sticky-parallax-header';
import {BlurView} from '@react-native-community/blur';
import {Button, Card, Divider, Icon, Input, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {CDN_BASE_URL} from '../components/util/variables';
import FastImage from 'react-native-fast-image';
import CustomizationOptionsCard from '../components/store_items/food/CustomizationOptionsCard';
import ItemQuantityControlButtons from '../components/ItemQuantityControlButtons';
import {computed} from 'mobx';
import {inject, observer} from 'mobx-react';
import {v4 as uuidv4} from 'uuid';

const {event, ValueXY} = Animated;
const scrollY = new ValueXY();

@inject('shopStore')
@observer
class FoodItemDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemOptions: {},
      isValid: false,
      options: {},
      specialInstructions: '',
      quantity: 1,
    };
  }

  componentDidMount() {
    const {item} = this.props.route.params;

    if (item && item.options) {
      const itemOptions = JSON.parse(JSON.stringify(item.options));
      this.setState({itemOptions});
    }

    this.customizationOptionsRef = {};
  }

  handleSelectionChange(optionTitle, selection) {
    const {
      state: {options},
    } = this;

    if (selection && optionTitle) {
      let tempOptionSelections = JSON.parse(JSON.stringify(options));
      tempOptionSelections[optionTitle] = selection;

      this.setState({options: tempOptionSelections}, () =>
        console.log(this.state.options),
      );
    }
  }

  handleAddToCart() {
    const {
      props: {
        navigation,
        route: {
          params: {storeId, item},
        },
      },
      state: {options, specialInstructions, quantity},
    } = this;
    const cartId = uuidv4();

    this.props.shopStore.addCartItemToStorage(
      {...item, options, specialInstructions, quantity, cartId},
      storeId,
      {ignoreExistingCartItems: true, instantUpdate: true},
    );

    navigation.goBack();
  }

  renderForeground = () => {
    const {
      navigation,
      route: {
        params: {
          item: {price, discountedPrice, image, name, description},
        },
      },
    } = this.props;
    const displayPrice =
      discountedPrice && price > discountedPrice ? discountedPrice : price;

    return (
      <View
        style={{
          flex: 1,
        }}>
        <FastImage
          source={{
            uri: `${CDN_BASE_URL}${image}`,
          }}
          style={styles.foregroundImage}
          resizeMode={FastImage.resizeMode.cover}
        />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
          }}>
          <View style={{flex: 1}}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text style={{fontSize: 20, fontFamily: 'ProductSans-Bold'}}>
                {name}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 16,
                  color: colors.text_secondary,
                  flexWrap: 'wrap',
                }}>
                {description}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              paddingBottom: 10,
              paddingLeft: 10,
            }}>
            <Text style={{fontSize: 16}}>from </Text>
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontFamily: 'ProductSans-Bold',
              }}>
              ₱{displayPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{paddingHorizontal: 15}}>
          <Divider />
        </View>
      </View>
    );
  };

  renderHeader = () => {
    const opacity = scrollY.y.interpolate({
      inputRange: [0, 150, 235],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });

    const left = scrollY.y.interpolate({
      inputRange: [0, 150, 180],
      outputRange: [12, 12, -40],
      extrapolate: 'clamp',
    });

    const arrowOpacity = scrollY.y.interpolate({
      inputRange: [0, 150, 180],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });

    const {
      navigation,
      route: {
        params: {
          item: {image, name},
        },
      },
    } = this.props;
    const {itemOptions} = this.state;

    return (
      <View>
        <Animated.View
          style={[
            styles.headerButtonContainer,
            {left},
            {opacity: arrowOpacity},
          ]}>
          <Button
            onPress={() => navigation.goBack()}
            type="clear"
            color={colors.icons}
            icon={<Icon name="arrow-left" color={colors.primary} />}
            buttonStyle={{borderRadius: 30}}
            containerStyle={[
              styles.buttonContainer,
              {backgroundColor: colors.icons, height: 40, elevation: 2},
            ]}
          />
        </Animated.View>
        <Animated.View style={[styles.headerContainer, {opacity}]}>
          <View style={styles.headerWrapper}>
            <Animated.View style={[styles.headerSearchContainer, {opacity}]}>
              <Button
                onPress={() => this.props.navigation.goBack()}
                type="clear"
                color={colors.icons}
                icon={<Icon name="arrow-left" color={colors.icons} />}
                buttonStyle={{borderRadius: 30}}
                titleStyle={{color: colors.icons}}
                containerStyle={[styles.buttonContainer, {height: 40}]}
              />

              <Image
                source={{
                  uri: `${CDN_BASE_URL}${image}`,
                }}
                style={styles.headerDetailsImage}
              />

              <Text style={styles.headerSearchText}>{name}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    );
  };

  renderBody = () => {
    const {
      props: {
        navigation,
        route: {
          params: {
            item: {image, name},
          },
        },
      },
      state: {itemOptions, specialInstructions},
    } = this;

    return (
      <View style={{paddingHorizontal: 15, paddingVertical: 10}}>
        <View
          style={{
            flex: 1,
            paddingVertical: 10,
          }}>
          <View>
            <Text style={{fontSize: 22, marginBottom: 5}}>Customization</Text>

            {Object.entries(itemOptions).map(
              ([optionTitle, optionData], index) => {
                const {multipleSelection, selection} = optionData;

                return (
                  <CustomizationOptionsCard
                    onIsValidChanged={(isValid) => this.setState({isValid})}
                    onSelectionChanged={() =>
                      this.handleSelectionChange(optionTitle, selection)
                    }
                    key={optionTitle}
                    title={optionTitle}
                    multipleSelection={multipleSelection}
                    selections={selection}
                    onDeleteCustomizationOption={() =>
                      this.setState({selectedOptionTitle: optionTitle})
                    }
                    onDeleteSelection={(selectionIndex) =>
                      this.handleDeleteSelection(optionTitle, selectionIndex)
                    }
                    onAddSelection={(values, {resetForm}) =>
                      this.handleAddSelection(optionTitle, values, {
                        resetForm,
                      })
                    }
                    onChangeMultipleSelection={() =>
                      this.handleChangeMultipleSelection(optionTitle)
                    }
                  />
                );
              },
            )}

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
                  Special Instructions
                </Text>
              </View>

              <Input
                multiline
                numberOfLines={3}
                value={specialInstructions}
                onChangeText={(value) =>
                  this.setState({specialInstructions: value})
                }
                inputStyle={{textAlignVertical: 'top'}}
                maxLength={200}
                placeholder={`Enter any special instructions for ${name}`}
              />
            </Card>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const {
      state: {quantity},
      renderForeground,
      renderHeader,
      renderBody,
    } = this;

    return (
      <View style={{...StyleSheet.absoluteFillObject}}>
        <StickyParallaxHeader
          headerType="AvatarHeader"
          hasBorderRadius={false}
          backgroundColor={colors.icons}
          scrollEvent={event([{nativeEvent: {contentOffset: {y: scrollY.y}}}], {
            useNativeDriver: false,
          })}
          parallaxHeight={330}
          transparentHeader={true}
          foreground={renderForeground.bind(this)}
          header={renderHeader.bind(this)}
          headerHeight={97}
          snapStartThreshold={150}
          snapStopThreshold={235}
          renderBody={renderBody.bind(this)}
          snapValue={150}>
          {renderBody.bind(this)}
        </StickyParallaxHeader>

        <View
          style={{
            flexDirection: 'row',
            height: 70,
            width: '100%',
            padding: 10,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: colors.primary,
          }}>
          <View
            style={{
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
            <ItemQuantityControlButtons
              ref={(itemQuantityControlButtonsRef) =>
                (this.itemQuantityControlButtonsRef = itemQuantityControlButtonsRef)
              }
              persistMinusButton
              onIncreaseQuantity={() =>
                this.setState((prevState) => ({
                  quantity: prevState.quantity + 1,
                }))
              }
              onDecreaseQuantity={() =>
                this.setState((prevState) => ({
                  quantity: prevState.quantity - 1,
                }))
              }
              itemQuantity={quantity}
              minusDisabled={quantity === 1}
            />
          </View>

          <View style={{flex: 1, paddingLeft: 10}}>
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 30,
                overflow: 'hidden',
              }}>
              <Button
                title="Add to cart"
                raised
                icon={<Icon name="plus" color={colors.icons} />}
                iconRight
                onPress={() => this.handleAddToCart()}
                titleStyle={{
                  color: colors.icons,
                  fontFamily: 'ProductSans-Bold',
                  fontSize: 22,
                  marginRight: '20%',
                }}
                buttonStyle={{
                  height: '100%',
                  backgroundColor: colors.accent,
                  borderRadius: 30,
                }}
                containerStyle={{
                  flex: 1,
                  padding: 0,
                  borderRadius: 30,
                }}
              />
            </View>
          </View>
        </View>

        <StatusBar
          translucent
          barStyle="light-content"
          backgroundColor="transparent"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 97,
    backgroundColor: colors.primary,
  },
  headerWrapper: {
    top: StatusBar.currentHeight,
    width: '100%',
    height: 97 - StatusBar.currentHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerImage: {
    width: 18,
    height: 18,
  },
  headerButtonContainer: {
    position: 'absolute',
    top: 50,
    zIndex: 4,
  },
  headerButton: {
    backgroundColor: 'white',
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 60,
  },
  headerSearchArrow: {
    width: 25,
    height: 25,
  },
  headerSearchText: {
    color: colors.icons,
    fontSize: 20,
  },
  headerDetailsImage: {
    width: 30,
    height: 30,
    marginHorizontal: 10,
    borderRadius: 7.5,
  },
  headerDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerDetailsText: {
    marginLeft: 10,
    color: 'gray',
    fontSize: 10,
    textAlign: 'right',
    paddingBottom: 3,
  },
  headerDetailsButton: {
    backgroundColor: '#3479F6',
    width: 80,
    height: 33,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  headerDetailsButtonTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  foregroundImage: {
    width: '110%',
    height: 250,
    marginLeft: -25,
    backgroundColor: colors.icons,
  },
  foregroundContainer: {
    flexDirection: 'row',
    marginBottom: 100,
    marginTop: 27,
    marginLeft: 27,
  },
  foregroundLogo: {
    width: 128,
    height: 128,
    borderRadius: 32,
  },
  foregroundDetails: {
    marginLeft: 15,
  },
  foregroundDetailsHeader: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'ProductSans-Light',
  },
  foregroundDetailsDesc: {
    color: 'gray',
    fontSize: 20,
  },
  foregroundActionsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
  },
  foregroundActionsButton: {
    backgroundColor: '#3479F6',
    width: 80,
    height: 33,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foregroundActionsButtonTitle: {
    marginLeft: 10,
    color: 'gray',
    fontSize: 10,
  },
  foregroundActionsShare: {
    width: 20,
    height: 20,
    marginLeft: 30,
  },
});

export default FoodItemDetailsScreen;
