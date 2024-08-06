import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Helper function to get initials from a name
const getInitials = (name) => {
  const initials = name.split(' ').map(word => word[0]).join('');
  return initials.toUpperCase();
};

const StudentChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const chatsRef = collection(FIREBASE_DB, 'Chats');
    const q = query(chatsRef, where('studentId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedChats = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(updatedChats);
      setLoading(false);
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
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{getInitials(item.chefName)}</Text>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.chatItemText}>{item.chefName}</Text>
        <Text style={styles.chatItemMessage}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE660F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headingmain}>Chats</Text>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chats available</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  flatListContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  headingmain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 20,
    marginTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.2,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 2 : 0,
    borderWidth: 1,
    borderColor: '#FE660F'
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FE660F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  chatItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2, // Reduced margin to bring text closer to the message
  },
  chatItemMessage: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
});

export default StudentChatListScreen;
