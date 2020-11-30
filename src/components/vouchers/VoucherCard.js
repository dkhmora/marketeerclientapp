import {Card} from 'native-base';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-elements';
import {colors} from '../../../assets/colors';

export default class VoucherCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      props: {
        voucher: {title, description, maxUses, voucherId, validUsers},
      },
    } = this;
    return (
      <Card
        style={{
          flex: 1,
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
            paddingHorizontal: 10,
            paddingVertical: 5,
            alignItems: 'flex-start',
          }}>
          <Text
            style={{
              fontFamily: 'ProductSans-Bold',
              fontSize: 18,
              marginBottom: 5,
            }}>
            {title}
          </Text>

          {description && description.length > 0 ? (
            <Text>{description}</Text>
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
              <Text style={{color: colors.text_secondary}}>
                *Valid for up to {maxUses} uses
              </Text>

              {validUsers && validUsers.includes('first_purchase_users') && (
                <Text style={{color: colors.text_secondary}}>
                  *Valid for new users
                </Text>
              )}

              {validUsers && validUsers.includes('all_users') && (
                <Text style={{color: colors.text_secondary}}>
                  *Valid for all users
                </Text>
              )}
            </View>

            <Button
              title="Claim Voucher"
              type="clear"
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
                overflow: 'hidden',
              }}
            />
          </View>
        </View>
      </Card>
    );
  }
}
