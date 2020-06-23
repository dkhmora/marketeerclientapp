import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image, Dimensions} from 'react-native';
import {observer, inject} from 'mobx-react';
import {Icon, Badge, Button} from 'react-native-elements';
import {colors} from '../../assets/colors';
import SlidingUpPanel from 'rn-sliding-up-panel';
import CartStoreList from '../components/CartStoreList';
import {SafeAreaView} from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDING_MENU_INITIAL_HEIGHT = 75;
const SLIDING_MENU_EXTENDED_HEIGHT =
  SCREEN_HEIGHT - SLIDING_MENU_INITIAL_HEIGHT;
@inject('shopStore')
@observer
class SlidingCartPanel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._panel.show({toValue: SLIDING_MENU_INITIAL_HEIGHT, velocity: 10});
  }

  openPanel() {
    this._panel.show();
  }

  render() {
    return (
      <SlidingUpPanel
        ref={(c) => (this._panel = c)}
        minimumVelocityThreshold={0.6}
        minimumDistanceThreshold={3}
        snappingPoints={[
          SLIDING_MENU_INITIAL_HEIGHT,
          SLIDING_MENU_EXTENDED_HEIGHT,
        ]}
        allowMomentum
        draggableRange={{
          top: SLIDING_MENU_EXTENDED_HEIGHT,
          bottom: SLIDING_MENU_INITIAL_HEIGHT,
        }}
        containerStyle={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.3)',
          elevation: 20,
        }}>
        <View
          style={{
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: '#fff',
            paddingTop: 25,
            paddingBottom: 10,
            paddingHorizontal: 15,
          }}>
          <TouchableOpacity
            onPress={() => this._panel.show()}
            style={{position: 'absolute', top: 0, right: 0, left: 0}}>
            <Icon name="chevron-up" color="black" />
          </TouchableOpacity>

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}>
              <Image
                source={require('../../assets/images/logo_cart.png')}
                style={{
                  height: 35,
                  width: 40,
                  resizeMode: 'center',
                  tintColor: colors.primary,
                  marginRight: 10,
                }}
              />

              <Badge
                value={this.props.shopStore.totalCartItemQuantity}
                badgeStyle={{backgroundColor: colors.accent}}
                containerStyle={{position: 'absolute', top: 4, right: 2}}
              />
            </View>

            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                flex: 1,
                fontSize: 26,
                fontFamily: 'ProductSans-Black',
                textAlignVertical: 'bottom',
              }}>
              ₱ {this.props.shopStore.totalCartSubTotal}
            </Text>

            <Button
              raised
              icon={<Icon name="arrow-right" color={colors.icons} />}
              iconRight
              title="Checkout"
              titleStyle={{
                color: colors.icons,
                fontFamily: 'ProductSans-Black',
                fontSize: 18,
                marginRight: '20%',
              }}
              containerStyle={{
                borderRadius: 24,
                padding: 0,
              }}
            />
          </View>

          <View style={{flex: 1, width: '100%', marginTop: 20}}>
            <CartStoreList emptyCartText="Your cart is empty" />
          </View>
        </View>
      </SlidingUpPanel>
    );
  }
}

export default SlidingCartPanel;
