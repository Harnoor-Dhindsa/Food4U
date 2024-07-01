import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';

const ChefChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  const fetchChats = async () => {
    const chatsRef = collection(FIREBASE_DB, 'Chats');
    const q = query(chatsRef, where('chefId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const chatsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setChats(chatsList);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const navigateToChat = (chat) => {
    navigation.navigate('ChefChatScreen', {
      chefId: chat.chefId,
      chefName: chat.chefName,
      studentId: chat.studentId,
      studentName: chat.studentName,
      studentProfilePic: chat.studentProfilePic,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item)}>
      <Image source={{ uri: item.studentProfilePic }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.chatItemText}>{item.studentName}</Text>
        <Text style={styles.chatItemSubText}>{item.studentEmail}</Text>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },
  flatListContainer: {
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    borderColor: '#FE660F',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  chatItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatItemSubText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ChefChatListScreen;
