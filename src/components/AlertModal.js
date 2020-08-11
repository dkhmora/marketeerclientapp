import React, {PureComponent} from 'react';
import {Overlay, Text, Button} from 'react-native-elements';
import {View} from 'react-native';

class AlertModal extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {isVisible, onConfirm, title, body, buttonText} = this.props;

    return (
      <Overlay
        isVisible={isVisible}
        statusBarTranslucent
        width="80%"
        height="auto"
        overlayStyle={{
          borderRadius: 10,
          padding: 15,
          width: '80%',
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

          {body && (
            <Text
              style={{
                fontSize: 20,
              }}>
              {body}
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginTop: 40,
            }}>
            <Button
              title={buttonText}
              type="clear"
              containerStyle={{
                alignSelf: 'flex-end',
                borderRadius: 30,
              }}
              onPress={() => onConfirm()}
            />
          </View>
        </View>
      </Overlay>
    );
  }
}

export default AlertModal;
