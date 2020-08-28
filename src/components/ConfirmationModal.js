import React, {PureComponent} from 'react';
import {Overlay, Text, Button} from 'react-native-elements';
import {View, Dimensions, ActivityIndicator} from 'react-native';
import {inject, observer} from 'mobx-react';
import FastImage from 'react-native-fast-image';
import {colors} from '../../assets/colors';

@inject('authStore')
@observer
class ConfirmationModal extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      closeModal,
      isVisible,
      onConfirm,
      title,
      body,
      image,
      loading,
    } = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          closeModal();
        }}
        width="80%"
        height="auto"
        animationType="fade"
        statusBarTranslucent
        overlayStyle={{
          width: '80%',
          borderRadius: 10,
          padding: 15,
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'ProductSans-Regular',
              paddingBottom: 20,
            }}>
            {title}
          </Text>

          <View>
            {typeof body === 'string' ? (
              <Text
                style={{
                  fontSize: 20,
                }}>
                {body}
              </Text>
            ) : (
              body
            )}
          </View>

          {image && (
            <View
              style={{
                height: Dimensions.get('screen').height * 0.4,
              }}>
              <FastImage
                source={{uri: image}}
                style={{
                  flex: 1,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 40,
            }}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={{flexDirection: 'row'}}>
                <Button
                  title="Cancel"
                  type="clear"
                  containerStyle={{
                    alignSelf: 'flex-end',
                    borderRadius: 30,
                  }}
                  onPress={() => closeModal()}
                />

                <Button
                  title="Confirm"
                  type="clear"
                  containerStyle={{
                    alignSelf: 'flex-end',
                    borderRadius: 30,
                  }}
                  onPress={() => onConfirm()}
                />
              </View>
            )}
          </View>
        </View>
      </Overlay>
    );
  }
}

export default ConfirmationModal;
