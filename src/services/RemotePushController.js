import {useEffect} from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const RemotePushController = (props) => {
  useEffect(() => {
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        // process the notification here
        if (notification) {
          if (notification.type === 'order_message') {
            props.navigation.navigate('Order Chat', {
              orderId: notification.orderId,
            });
          }

          if (
            notification.type === 'order_update' ||
            notification.type === 'order_review'
          ) {
            props.navigation.navigate('Order Details', {
              orderId: notification.orderId,
            });
          }
        }

        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      // Android only: GCM or FCM Sender ID
      senderID: '1549607298',
      popInitialNotification: true,
      requestPermissions: true,
      vibrate: true,
      vibration: 300,
      playSound: true,
      sound: 'default',
    });
  }, [props.navigation]);

  return null;
};

export default RemotePushController;
