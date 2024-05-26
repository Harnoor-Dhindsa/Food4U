import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../../_utils/FirebaseConfig';

const HomeScreen = ({ navigation }) => {
  const [chefs, setChefs] = useState([]);
  const [menus, setMenus] = useState([]);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChefs = async () => {
    const chefsCollection = collection(FIREBASE_DB, 'ChefsProfiles');
    const chefsSnapshot = await getDocs(chefsCollection);
    const chefsList = chefsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(chef => chef.firstName);
    setChefs(chefsList);
  };

  const fetchMenus = async () => {
    const menusCollection = collection(FIREBASE_DB, 'Menus');
    const menusSnapshot = await getDocs(menusCollection);
    const menusList = menusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenus(menusList);
  };

  useEffect(() => {
    fetchChefs();
    fetchMenus();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchChefs(), fetchMenus()]).then(() => setRefreshing(false));
  }, []);

  const filterData = (query) => {
    const lowercasedQuery = query.toLowerCase();
    
    const filteredChefsList = chefs.filter(chef => {
      const chefName = `${chef.firstName || ''} ${chef.lastName || ''}`.toLowerCase();
      return chefName.includes(lowercasedQuery);
    });

    const filteredMenusList = menus.filter(menu => {
      const menuHeading = menu.heading ? menu.heading.toLowerCase() : '';
      const itemsMatch = menu.items ? menu.items.some(item => item.name && item.name.toLowerCase().includes(lowercasedQuery)) : false;
      return menuHeading.includes(lowercasedQuery) || itemsMatch;
    });

    setFilteredChefs(filteredChefsList);
    setFilteredMenus(filteredMenusList);
  };

  useEffect(() => {
    filterData(searchQuery);
  }, [searchQuery, chefs, menus]);

  const navigateToMenuDetail = (menu) => {
    navigation.navigate('MenuDetail', { menu });
  };

  const navigateToMenuList = (chefId) => {
    navigation.navigate('MenuList', { chefId });
  };

  const renderChefItem = ({ item }) => (
    <TouchableOpacity style={styles.chefContainer} onPress={() => navigateToMenuList(item.id)}>
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuContainer} onPress={() => navigateToMenuDetail(item)}>
      {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.image} /> : null}
      <View style={styles.infoContainer}>
        <Text style={styles.menuTitle}>{item.heading}</Text>
        <Text style={styles.menuDescription}>{item.days.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by chef name, menu heading, or dish..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={searchQuery ? filteredMenus.length > 0 ? filteredMenus : filteredChefs : chefs}
        renderItem={searchQuery ? filteredMenus.length > 0 ? renderMenuItem : renderChefItem : renderChefItem}
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 20,
    paddingHorizontal: 10,
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
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    borderColor: '#FE660F',
    borderWidth: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuDescription: {
    fontSize: 14,
    color: 'gray',
  },
});

export default HomeScreen;
