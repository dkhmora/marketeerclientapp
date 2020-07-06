import {observable, action} from 'mobx';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import GiftedChat from 'react-native-gifted-chat';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import Geolocation from '@react-native-community/geolocation';
import geohash from 'ngeohash';
import functions from '@react-native-firebase/functions';

class generalStore {
  @observable orders = [];
  @observable orderItems = [];
  @observable orderMessages = [];
  @observable unsubscribeGetMessages = null;
  @observable currentLocation = null;
  @observable currentLocationDetails = null;
  @observable deliverToCurrentLocation = true;
  @observable setLocationGeohash = null;

  @action async getAddressFromCoordinates({latitude, longitude}) {
    return await functions()
      .httpsCallable('getAddressFromCoordinates')({latitude, longitude})
      .then((response) => {
        return response.data.locationDetails;
      });
  }

  @action setCurrentLocation() {
    Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
        };

        this.setLocationGeohash = geohash.encode(
          coords.latitude,
          coords.longitude,
          20,
        );

        this.currentLocation = {...coords};
      },
      (err) => console.log(err),
      {
        timeout: 20000,
      },
    );
  }

  @action async updateCoordinates(
    userId,
    lastDeliveryLocation,
    locationDetails,
  ) {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        lastDeliveryLocation,
        locationDetails,
      })
      .then(() => console.log('Successfully updated user coordinates'))
      .catch((err) => console.log(err));
  }

  @action async getImageURI(imageRef) {
    if (imageRef) {
      const ref = storage().ref(imageRef);
      const link = await ref.getDownloadURL();
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
        if (documentSnapshot.exists) {
          if (
            documentSnapshot.data().messages.length <= 0 &&
            this.orderMessages.length > 0
          ) {
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
      .collection('orders')
      .where('userId', '==', userId)
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

  @action async getOrderItems(orderId) {
    const orderItems = await firestore()
      .collection('order_items')
      .doc(orderId)
      .get()
      .then((document) => {
        if (document.exists) {
          return document.data().items;
        }
      });

    return orderItems;
  }
}

export default generalStore;
