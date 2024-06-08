import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';

const StudentChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  const fetchChats = async () => {
    const chatsRef = collection(FIREBASE_DB, 'Chats');
    const q = query(chatsRef, where('studentId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const chatsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setChats(chatsList);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const navigateToChat = (chat) => {
    navigation.navigate('StudentChatScreen', {
      chefId: chat.chefId,
      chefName: chat.chefName,
      studentId: chat.studentId,
      studentName: chat.studentName,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item)}>
      <Text style={styles.chatItemText}>{item.chefName}</Text>
      <Text style={styles.chatItemSubText}>{item.chefEmail}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  flatListContainer: {
    paddingHorizontal: 20,
  },
  chatItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatItemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatItemSubText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default StudentChatListScreen;
