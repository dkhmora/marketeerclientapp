import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import GiftedChat from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
class generalStore {
  @observable orders = [];
  @observable orderItems = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;

  @action async getImageURI(imageRef) {
    if (imageRef) {
      const ref = storage().ref(imageRef);
      const link = await ref.getDownloadURL();
      console.log(link);
      return link;
    }
    return 0;
  }

  @action async getImageUrl(imageRef) {
    const ref = storage().ref(imageRef);
    const link = await ref.getDownloadURL();

    return link;
  }

  @action getMessages(orderId) {
    this.unsubscribeGetMessages = firestore()
      .collection('order_chats')
      .doc(orderId)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot.data()) {
          if (
            documentSnapshot.data().messages.length <= 0 &&
            this.orderMessages.length > 0
          ) {
            console.log('orderMessages', this.orderMessages);
            this.orderMessages = GiftedChat.append(
              this.orderMessages,
              documentSnapshot.data().messages,
            );
          } else {
            this.orderMessages = documentSnapshot.data().messages.reverse();
          }
        } else {
          firestore()
            .collection('order_chats')
            .doc(orderId)
            .set({messages: []});
        }
      });
  }

  @action async sendMessage(orderId, message) {
    const createdAt = Date.parse(message.createdAt);
    message.createdAt = createdAt;

    await firestore()
      .collection('order_chats')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
  }

  @action async createImageMessage(orderId, messageId, user, imageLink) {
    const createdAt = new Date().getTime();
    const message = {
      _id: messageId,
      image: imageLink,
      user,
      createdAt,
    };

    await firestore()
      .collection('order_chats')
      .doc(orderId)
      .update('messages', firestore.FieldValue.arrayUnion(message))
      .then(() => console.log('Successfully sent the message'))
      .catch((err) => console.log(err));
  }

  @action async sendImage(orderId, user, imagePath) {
    const messageId = uuidv4();
    const imageRef = `/images/orders/${orderId}/order_chat/${messageId}`;

    await storage()
      .ref(imageRef)
      .putFile(imagePath)
      .then(() => {
        return this.getImageUrl(imageRef);
      })
      .then((imageLink) =>
        this.createImageMessage(orderId, messageId, user, imageLink),
      )
      .then(() => console.log('Image successfully uploaded and sent!'))
      .catch((err) => console.log(err));
  }

  @action setOrders(userId) {
    firestore()
      .collection('users')
      .doc(userId)
      .collection('orders')
      .get()
      .then((querySnapshot) => {
        const data = [];

        querySnapshot.forEach((doc, index) => {
          data.push(doc.data());
          data[index].orderId = doc.id;
        });
        this.orders = data;
      })
      .catch((err) => console.log(err));
  }

  @action async setOrderItems(orderId) {
    await firestore()
      .collection('order_items')
      .doc(orderId)
      .get()
      .then((document) => {
        return (this.orderItems = document.data().items);
      });
  }
}

export default generalStore;
