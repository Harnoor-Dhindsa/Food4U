import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../_utils/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const MenuList = ({ route, navigation }) => {
  const { chefId } = route.params;
  const [menus, setMenus] = useState([]);
  const [chef, setChef] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const user = FIREBASE_AUTH.currentUser;

  const fetchMenus = async () => {
    const menusCollection = collection(FIREBASE_DB, 'Menus');
    const q = query(menusCollection, where('chefId', '==', chefId));
    const menusSnapshot = await getDocs(q);
    const menusList = menusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenus(menusList);
  };

  const fetchChef = async () => {
    const chefDoc = doc(FIREBASE_DB, 'ChefsProfiles', chefId);
    const chefSnapshot = await getDoc(chefDoc);
    if (chefSnapshot.exists()) {
      setChef(chefSnapshot.data());
    }
  };

  useEffect(() => {
    fetchChef();
    fetchMenus();
  }, [chefId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchChef(), fetchMenus()]).then(() => setRefreshing(false));
  }, [chefId]);

  const navigateToChat = async () => {
    if (chef && user) {
      const studentDoc = await getDoc(doc(FIREBASE_DB, 'StudentsProfiles', user.uid));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        const studentName = `${studentData.firstName} ${studentData.lastName}`; // Ensure you get a proper name
        navigation.navigate('StudentChatScreen', {
          chefId,
          chefName: `${chef.firstName} ${chef.lastName}`,
          studentId: user.uid,
          studentName,
          chefProfilePic: chef.profilePic,
        });
      } else {
        console.error('Student profile not found');
      }
    } else {
      console.error('Chef or user data not available');
    }
  };

  const navigateToMenuDetail = (menu) => {
    navigation.navigate('MenuDetail', { menu });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuContainer} onPress={() => navigateToMenuDetail(item)}>
      {item.avatars && item.avatars.length > 0 ? (
        <Image source={{ uri: item.avatars[0] }} style={styles.image} onError={(e) => console.log(e.nativeEvent.error)} />
      ) : null}
      <View style={styles.infoContainer}>
        <Text style={styles.menuTitle}>{item.heading}</Text>
        <Text style={styles.menuDescription}>{item.days.join(', ')}</Text>
      </View>
      <Text style={styles.menuPrice}>${item.monthlyPrice}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FE660F" />
      </TouchableOpacity>
      {chef && (
        <View style={styles.chefInfoContainer}>
          <Image source={{ uri: chef.profilePic }} style={styles.chefImage} />
          <Text style={styles.chefName}>{chef.firstName} {chef.lastName}</Text>
          <View style={styles.chefContact}>
            <Ionicons name="mail" size={16} color="gray" />
            <Text style={styles.chefEmail}>{chef.email}</Text>
          </View>
          {chef.phoneNumber && (
            <View style={styles.chefContact}>
              <Ionicons name="call" size={16} color="gray" />
              <Text style={styles.chefPhone}>{chef.phoneNumber}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" style={styles.chatIcon} />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={menus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    backgroundColor: '#EDF3EB',
  },
  flatListContainer: {
    paddingHorizontal: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: '#FE660F',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuDescription: {
    fontSize: 14,
    color: '#888',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE660F',
    marginLeft: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  chefInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chefImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  chefName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  chefContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  chefEmail: {
    fontSize: 16,
    color: 'gray',
    marginLeft: 5,
  },
  chefPhone: {
    fontSize: 16,
    color: 'gray',
    marginLeft: 5,
  },
  chatButton: {
    marginTop: 10,
    flexDirection: 'row',
    backgroundColor: '#FE660F',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  chatIcon: {
    marginRight: 5,
  },
  chatButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MenuList;