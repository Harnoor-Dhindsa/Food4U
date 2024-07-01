import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const StudentChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const chatsRef = collection(FIREBASE_DB, 'Chats');
    const q = query(chatsRef, where('studentId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedChats = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(updatedChats);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const navigateToChat = (chat) => {
    navigation.navigate('StudentChatScreen', {
      chefId: chat.chefId,
      chefName: chat.chefName,
      studentId: chat.studentId,
      studentName: chat.studentName,
      chefProfilePic: chat.chefProfilePic,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item)}>
      <View style={styles.avatarContainer}>
        {item.chefProfilePic ? (
          <Image source={{ uri: item.chefProfilePic }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="gray" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.chatItemText}>{item.chefName}</Text>
        <Text style={styles.chatItemSubText}>{item.chefEmail}</Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adding padding for iOS
  },
  flatListContainer: {
    paddingHorizontal: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.5, // Adjusting shadow opacity for iOS
    shadowRadius: 2,
    elevation: Platform.OS === 'android' ? 2 : 0, // Elevation for Android only
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
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
