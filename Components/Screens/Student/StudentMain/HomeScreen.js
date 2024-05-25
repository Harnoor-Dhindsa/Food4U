import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../../_utils/FirebaseConfig';

const HomeScreen = ({ navigation }) => {
  const [chefs, setChefs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChefs = async () => {
    const chefsCollection = collection(FIREBASE_DB, 'ChefsProfiles');
    const chefsSnapshot = await getDocs(chefsCollection);
    const chefsList = chefsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(chef => chef.firstName);
    setChefs(chefsList);
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChefs().then(() => setRefreshing(false));
  }, []);

  const navigateToMenuList = (chefId) => {
    navigation.navigate('MenuList', { chefId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chefContainer} onPress={() => navigateToMenuList(item.id)}>
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chefs}
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
    backgroundColor: '#EDF3EB',
  },
  flatListContainer: {
    padding: 20,
  },
  chefContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    borderColor: '#FE660F',
    borderWidth: 2,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
});

export default HomeScreen;
