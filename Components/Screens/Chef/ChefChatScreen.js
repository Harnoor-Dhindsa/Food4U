import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert, Modal, Image } from 'react-native';
import { GiftedChat, Bubble, Send, Actions } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../_utils/FirebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, doc, setDoc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CustomInputToolbar from '../../others/CustomInputToolbar';

const ChefChatScreen = ({ route, navigation }) => {
  const { chefId, chefName, studentId, studentName, studentProfilePic } = route.params;
  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const user = FIREBASE_AUTH.currentUser;
  const storage = getStorage();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();

    if (!chefId || !chefName || !studentId || !studentName) {
      console.error('Missing navigation parameters:', { chefId, chefName, studentId, studentName });
      alert('Missing necessary chat details.');
      navigation.goBack();
      return;
    }

    const messagesRef = collection(FIREBASE_DB, 'Chats', `${chefId}_${studentId}`, 'Messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesFirebase = snapshot.docs.map((doc) => {
        const firebaseData = doc.data();

        const data = {
          _id: doc.id,
          text: firebaseData.text || '',
          createdAt: firebaseData.createdAt.toDate(),
          user: {
            _id: firebaseData.user._id,
            name: firebaseData.user.name,
            avatar: firebaseData.user.avatar || getInitials(firebaseData.user.name),
          },
          image: firebaseData.image || '',
        };

        return data;
      });

      setMessages(messagesFirebase);
    });

    return () => unsubscribe();
  }, [chefId, studentId]);

  const onSend = useCallback(async (messages = []) => {
    const chatId = `${chefId}_${studentId}`;
    const messagesRef = collection(FIREBASE_DB, 'Chats', chatId, 'Messages');
    const writes = messages.map((m) => addDoc(messagesRef, { ...m, createdAt: Timestamp.now() }));

    const senderId = user.uid;
    const recipientId = senderId === chefId ? studentId : chefId;

    const chatDoc = doc(FIREBASE_DB, 'Chats', chatId);
    const chatSnap = await getDoc(chatDoc);
    if (!chatSnap.exists()) {
      await setDoc(chatDoc, {
        chefId,
        chefName,
        chefProfilePic: user.photoURL,
        studentId,
        studentName,
        lastMessage: messages[0].text || 'Image',
        lastMessageAt: Timestamp.now(),
      });
    } else {
      await updateDoc(chatDoc, {
        lastMessage: messages[0].text || 'Image',
        lastMessageAt: Timestamp.now(),
      });
    }

    await Promise.all(writes);
    sendPushNotification(recipientId, messages[0].text || 'Image', senderId);
  }, [chefId, studentId, chefName, user.photoURL, studentName]);

  const sendPushNotification = async (recipientId, message, senderId) => {
    const recipientDoc = await getDoc(doc(FIREBASE_DB, senderId === chefId ? 'StudentsProfiles' : 'ChefsProfiles', recipientId));
    const token = recipientDoc.data()?.expoPushToken;

    const senderDoc = await getDoc(doc(FIREBASE_DB, senderId === chefId ? 'ChefsProfiles' : 'StudentsProfiles', senderId));
    const senderName = senderDoc.data()?.firstName || 'Someone';

    if (token) {
      const notificationMessage = {
        to: token,
        sound: 'default',
        title: "Food4U",
        body: `${senderName} sent you a message: ${message}`,
        data: { message },
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationMessage),
      });
    }
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const asset = result.assets[0];
        const uploadUri = asset.uri;

        // Check if the URI starts with file:// and adjust accordingly
        const uri = uploadUri.startsWith('file://') ? uploadUri : 'file://' + uploadUri;

        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const fileName = uri.split('/').pop();
        const storageRef = ref(storage, `images/${fileName}`);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        const imageMessage = {
          _id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          user: {
            _id: user.uid,
            name: user.displayName || user.email,
            avatar: user.photoURL,
          },
          image: downloadURL,
        };

        onSend([imageMessage]);
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleActionButtonPress = () => {
    setModalVisible(true);
  };

  const handleLongPress = (message) => {
    if (message && message.user && message.user._id === user.uid) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteMessage(message),
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('Error', 'You can only delete your own messages.');
    }
  };

  const deleteMessage = async (message) => {
    try {
      if (!message || !message._id || !message.user || !message.user._id) {
        console.error('Invalid message object:', message);
        return;
      }

      const chatId = `${chefId}_${studentId}`;
      const messageRef = doc(FIREBASE_DB, 'Chats', chatId, 'Messages', message._id);
      const messageSnap = await getDoc(messageRef);

      if (!messageSnap.exists()) {
        console.error('Message does not exist');
        return;
      }

      const messageData = messageSnap.data();
      const messageSenderId = messageData.user._id;

      if (messageSenderId === user.uid) {
        await deleteDoc(messageRef);

        // Update local state to reflect the change
        setMessages((previousMessages) =>
          previousMessages.filter((msg) => msg._id !== message._id)
        );
      } else {
        Alert.alert('Error', 'You can only delete your own messages.');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete the message. Please try again.');
    }
  };

  const renderActions = (props) => (
    <Actions
      {...props}
      icon={() => (
        <Ionicons name="add" size={24} color="#FE660F" />
      )}
      onPress={handleActionButtonPress}
    />
  );

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: { backgroundColor: '#FFEDD5', marginBottom: 5 },
        right: { backgroundColor: '#FE660F', marginBottom: 5 },
      }}
      textStyle={{
        left: { color: 'black' },
        right: { color: 'white' },
      }}
      onLongPress={() => handleLongPress(props.currentMessage)}
    />
  );

  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendingContainer}>
        <Ionicons name="send" size={24} color="#FE660F" />
      </View>
    </Send>
  );

  const renderMessageImage = (props) => (
    <View style={{ borderRadius: 15, padding: 2 }}>
      <Image
        source={{ uri: props.currentMessage.image }}
        style={{ width: 200, height: 200, borderRadius: 15, resizeMode: 'cover' }}
      />
    </View>
  );

  const getInitials = (name) => {
    const initials = name?.split(' ').map((word) => word[0]).join('');
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
  };

  const CustomAvatar = ({ avatar }) => {
    return (
      <Image
        style={{ width: 32, height: 32, borderRadius: 16 }}
        source={{ uri: avatar || getInitials('User') }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{studentName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: user.uid,
          name: user.displayName || user.email,
          avatar: user.photoURL || getInitials(user.displayName || user.email),
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        alwaysShowSend
        renderActions={renderActions}
        renderInputToolbar={(props) => (
          <CustomInputToolbar {...props} />
        )}
        renderMessageImage={renderMessageImage}
        renderAvatar={(props) => <CustomAvatar avatar={props.currentMessage.user.avatar} />}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleImagePick} style={styles.modalButton}>
              <Ionicons name="image" size={24} color="#FE660F" />
              <Text style={styles.modalButtonText}>Pick Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButtonText: {
    fontSize: 18,
    marginLeft: 10,
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseButtonText: {
    fontSize: 18,
    color: '#FE660F',
  },
});

export default ChefChatScreen;
