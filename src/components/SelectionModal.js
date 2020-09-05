import React, {PureComponent} from 'react';
import {Overlay, Text, Button, Icon} from 'react-native-elements';
import {View, SafeAreaView, StatusBar, Platform} from 'react-native';
import {colors} from '../../assets/colors';

class SelectionModal extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isVisible,
      title,
      closeModal,
      closeButton,
      renderItems,
      confirmDisabled,
    } = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        fullScreen
        animationType="fade"
        width="auto"
        height="auto"
        overlayStyle={{
          flex: 1,
          padding: 0,
          backgroundColor:
            Platform.OS === 'ios' ? colors.primary : colors.icons,
        }}>
        <SafeAreaView style={{flex: 1}}>
          <StatusBar barStyle="light-content" />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              height: 60,
              backgroundColor: colors.primary,
              alignItems: 'center',
              elevation: 6,
            }}>
            <Text
              style={{
                fontSize: 20,
                color: colors.icons,
              }}>
              {title}
            </Text>

            {closeButton && (
              <Button
                type="clear"
                icon={<Icon name="x" color={colors.icons} />}
                titleStyle={{color: colors.icons}}
                containerStyle={{
                  borderRadius: 30,
                }}
                onPress={() => closeModal()}
              />
            )}
          </View>

          {renderItems}

          <SafeAreaView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -24,
              padding: 10,
              elevation: 10,
              backgroundColor: colors.primary,
              borderTopRightRadius: 24,
              borderTopLeftRadius: 24,
            }}>
            <Button
              title="Confirm"
              titleStyle={{color: colors.icons}}
              disabled={confirmDisabled}
              buttonStyle={{backgroundColor: colors.accent, height: 50}}
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
                flex: 1,
                margin: Platform.OS === 'ios' ? 10 : 0,
              }}
              onPress={() => closeModal()}
            />
          </SafeAreaView>
        </SafeAreaView>
      </Overlay>
    );
  }
}

export default SelectionModal;
