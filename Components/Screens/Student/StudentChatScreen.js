import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, Actions } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_STORAGE } from '../../../_utils/FirebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const StudentChatScreen = ({ route, navigation }) => {
  const { chefId, chefName, studentId, studentName, chefProfilePic } = route.params;
  const [messages, setMessages] = useState([]);
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
            avatar: firebaseData.user.avatar,
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

    const chatDoc = doc(FIREBASE_DB, 'Chats', chatId);
    const chatSnap = await getDoc(chatDoc);
    if (!chatSnap.exists()) {
      await setDoc(chatDoc, {
        chefId,
        chefName,
        chefProfilePic,
        studentId,
        studentName,
        studentProfilePic: user.photoURL,
        lastMessage: messages[0].text,
        lastMessageAt: Timestamp.now(),
      });
    } else {
      await updateDoc(chatDoc, {
        lastMessage: messages[0].text,
        lastMessageAt: Timestamp.now(),
      });
    }

    await Promise.all(writes);
  }, [chefId, studentId, chefName, chefProfilePic, studentName, user.photoURL]);

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

  const renderActions = (props) => (
    <Actions
      {...props}
      options={{
        ['Send Image']: handleImagePick,
      }}
      icon={() => (
        <Ionicons name="image" size={24} color="#FE660F" />
      )}
      onSend={(args) => console.log(args)}
    />
  );

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: { backgroundColor: '#FFEDD5' },
        right: { backgroundColor: '#FE660F' },
      }}
      textStyle={{
        left: { color: 'black' },
        right: { color: 'white' },
      }}
    />
  );

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.primaryInputToolbar}
    />
  );

  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendingContainer}>
        <Ionicons name="send" size={24} color="#FE660F" />
      </View>
    </Send>
  );

  const getUserData = () => ({
    _id: user.uid,
    name: user.displayName || user.email,
    avatar: user.photoURL,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FE660F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chefName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={getUserData()}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderActions={renderActions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3EB',
    paddingTop: Platform.OS === 'android' ? 0 : 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FE660F',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FE660F',
  },
  inputToolbar: {
    backgroundColor: '#FFEDD5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 5,
  },
  primaryInputToolbar: {
    alignItems: 'center',
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default StudentChatScreen;
