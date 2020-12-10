import {inject, observer} from 'mobx-react';
import {Card} from 'native-base';
import React, {Component} from 'react';
import {View, TouchableWithoutFeedback} from 'react-native';
import {Button, Divider, Icon, Text} from 'react-native-elements';
import {colors} from '../../../assets/colors';
import {claimVoucher} from '../../util/firebase-functions';
import * as Animatable from 'react-native-animatable';

@inject('generalStore')
@observer
class VoucherCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClaimVoucher = (voucherId) => {
    this.props.generalStore
      .toggleAppLoader()
      .then(() => claimVoucher(voucherId))
      .then(() => this.props.generalStore.toggleAppLoader());
  };

  render() {
    const {
      props: {
        generalStore: {
          useableVoucherIds,
          userDetails: {claimedVouchers},
        },
        onDeliveryVoucherPress,
        voucherSelected,
        voucher: {
          title,
          description,
          maxUses,
          voucherId,
          validUsers,
          maxClaimsReached,
          disabled,
          type,
        },
        claimed,
      },
      handleClaimVoucher,
    } = this;
    const voucherMaxUsageNumber =
      claimedVouchers?.[voucherId] !== undefined
        ? claimedVouchers[voucherId]
        : 0;
    const usageNumber = maxUses - voucherMaxUsageNumber;
    const voucherMaxUsageReached = voucherMaxUsageNumber <= 0;
    const voucherIsApplicable =
      this.props.generalStore.useableVoucherIds[voucherId] > 0;

    return (
      <TouchableWithoutFeedback
        onPress={
          onDeliveryVoucherPress && type === 'delivery_discount'
            ? () => onDeliveryVoucherPress(voucherId)
            : null
        }>
        <Card
          style={{
            flex: 1,
            flexDirection: 'row',
            padding: 0,
            margin: 0,
            borderRadius: 8,
            elevation: 2,
            overflow: 'hidden',
          }}>
          <View
            style={{
              flex: 1,
              borderRadius: 8,
              overflow: 'hidden',
              padding: 10,
              alignItems: 'flex-start',
              backgroundColor: colors.accent,
              borderWidth: 6,
              borderColor: colors.icons,
            }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginBottom: 5,
              }}>
              <Icon name="tag" color={colors.icons} size={18} />

              <Text
                style={{
                  fontFamily: 'ProductSans-Bold',
                  fontSize: 18,
                  color: colors.icons,
                  textAlignVertical: 'center',
                  paddingHorizontal: 5,
                }}>
                {title}
              </Text>

              {usageNumber > 0 && (
                <Text
                  numberOfLines={1}
                  style={{color: colors.icons, fontSize: 12}}>
                  Used {usageNumber} times
                </Text>
              )}
            </View>

            <Divider style={{backgroundColor: colors.icons, width: '100%'}} />

            {description && description.length > 0 ? (
              <Text style={{color: colors.icons}}>{description}</Text>
            ) : null}

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: 10,
              }}>
              <View>
                <Text style={{color: colors.icons, fontSize: 12}}>
                  *Valid for up to {maxUses} uses
                </Text>

                {validUsers && validUsers.includes('first_purchase_users') && (
                  <Text style={{color: colors.icons, fontSize: 12}}>
                    *Valid for new users
                  </Text>
                )}

                {validUsers && validUsers.includes('all_users') && (
                  <Text style={{color: colors.icons, fontSize: 12}}>
                    *Valid for all users
                  </Text>
                )}
              </View>

              {!(claimed || disabled || maxClaimsReached) && (
                <Button
                  title="Claim Voucher"
                  titleStyle={{color: colors.icons}}
                  type="outline"
                  buttonStyle={{
                    borderColor: colors.icons,
                    borderWidth: 1,
                    borderRadius: 30,
                  }}
                  containerStyle={{
                    alignSelf: 'flex-end',
                    borderRadius: 30,
                    overflow: 'hidden',
                  }}
                  onPress={() => handleClaimVoucher(voucherId)}
                />
              )}
            </View>
          </View>

          {((!claimed && (maxClaimsReached || disabled)) ||
            !voucherIsApplicable ||
            voucherMaxUsageReached) && (
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
              }}>
              <Text
                style={{
                  color: colors.icons,
                  fontFamily: 'ProductSans-Bold',
                  fontSize: 16,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: 10,
                  elevation: 3,
                  zIndex: 10,
                  overflow: 'hidden',
                }}>
                {voucherMaxUsageReached || !voucherIsApplicable
                  ? 'Voucher used for a maximum number of times'
                  : 'Voucher has run out'}
              </Text>
            </View>
          )}

          {onDeliveryVoucherPress && (
            <View
              style={{
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                width: 35,
              }}>
              {voucherSelected === voucherId && (
                <Animatable.View
                  useNativeDriver
                  animation="bounceIn"
                  duration={300}>
                  <Icon
                    name="check"
                    color={colors.primary}
                    style={{
                      backgroundColor: colors.icons,
                      elevation: 3,
                      borderRadius: 30,
                    }}
                  />
                </Animatable.View>
              )}
            </View>
          )}
        </Card>
      </TouchableWithoutFeedback>
    );
  }
}

export default VoucherCard;
