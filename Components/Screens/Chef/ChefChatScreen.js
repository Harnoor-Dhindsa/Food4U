import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../_utils/FirebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

const ChefChatScreen = ({ route, navigation }) => {
  const { chefId, chefName, studentId, studentName, studentProfilePic } = route.params;
  const [messages, setMessages] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
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
          text: firebaseData.text,
          createdAt: firebaseData.createdAt.toDate(), // converting Firestore timestamp to JS Date object
          user: {
            _id: firebaseData.user._id,
            name: firebaseData.user.name,
            avatar: firebaseData.user.avatar, // Make sure avatar URL is set here
          },
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
        chefProfilePic: user.photoURL,
        studentId,
        studentName,
        studentProfilePic,
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
  }, [chefId, studentId, chefName, user.photoURL, studentName, studentProfilePic]);

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
    avatar: user.photoURL, // Ensure avatar URL is passed here
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#EDF3EB' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FE660F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{studentName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={getUserData()}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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

export default ChefChatScreen;
