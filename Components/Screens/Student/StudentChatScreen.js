import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../_utils/FirebaseConfig';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const StudentChatScreen = ({ route, navigation }) => {
  const { chefId, chefName, studentId, studentName } = route.params;
  const [messages, setMessages] = useState([]);

  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const messagesRef = collection(FIREBASE_DB, 'Chats', `${chefId}_${studentId}`, 'Messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesFirebase = snapshot.docs.map((doc) => ({
        _id: doc.id,
        text: '',
        createdAt: new Date(),
        ...doc.data(),
      }));
      setMessages(messagesFirebase);
    });

    return () => unsubscribe();
  }, []);

  const onSend = useCallback(async (messages = []) => {
    const chatId = `${chefId}_${studentId}`;
    const messagesRef = collection(FIREBASE_DB, 'Chats', chatId, 'Messages');
    const writes = messages.map((m) => addDoc(messagesRef, m));

    // Create chat document for both student and chef if not already exists
    const chatDoc = doc(FIREBASE_DB, 'Chats', chatId);
    const chatSnap = await getDoc(chatDoc);
    if (!chatSnap.exists()) {
      await setDoc(chatDoc, {
        chefId,
        chefName,
        studentId,
        studentName,
        lastMessage: messages[0].text,
        lastMessageAt: new Date(),
      });
    } else {
      await updateDoc(chatDoc, {
        lastMessage: messages[0].text,
        lastMessageAt: new Date(),
      });
    }

    await Promise.all(writes);
  }, []);

  const getUserData = () => ({
    _id: user.uid,
    name: user.displayName || user.email,
  });

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={getUserData()}
    />
  );
};

export default StudentChatScreen;
