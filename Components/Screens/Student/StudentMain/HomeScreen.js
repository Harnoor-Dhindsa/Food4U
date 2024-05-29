import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../../_utils/FirebaseConfig';

const HomeScreen = ({ navigation }) => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const chefsCollection = collection(FIREBASE_DB, 'ChefsProfiles');
      const chefsSnapshot = await getDocs(chefsCollection);
      const chefsList = chefsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(chef => chef.firstName);
      setChefs(chefsList);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChefs();
    setRefreshing(false);
  };

  const filteredChefs = chefs.filter(chef =>
    `${chef.firstName} ${chef.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chefs</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chefs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#FE660F" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filteredChefs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyStateText}>No chefs available.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FE660F',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
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
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  loadingIndicator: {
    marginTop: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
    fontSize: 16,
  },
});

export default HomeScreen;
