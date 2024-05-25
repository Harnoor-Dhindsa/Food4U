import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../_utils/FirebaseConfig';

const MenuList = ({ route, navigation }) => {
  const { chefId } = route.params;
  const [menus, setMenus] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMenus = async () => {
    const menusCollection = collection(FIREBASE_DB, 'Menus');
    const q = query(menusCollection, where('chefId', '==', chefId));
    const menusSnapshot = await getDocs(q);
    const menusList = menusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenus(menusList);
  };

  useEffect(() => {
    fetchMenus();
  }, [chefId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus().then(() => setRefreshing(false));
  }, [chefId]);

  const navigateToMenuDetail = (menu) => {
    navigation.navigate('MenuDetail', { menu });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuContainer} onPress={() => navigateToMenuDetail(item)}>
      {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.image} /> : null}
      <View style={styles.infoContainer}>
        <Text style={styles.menuTitle}>{item.heading}</Text>
        <Text style={styles.menuDescription}>{item.days}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
    padding: 20,
    backgroundColor: '#EDF3EB',
  },
  flatListContainer: {
    padding: 20,
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
  infoContainer: {
    flex: 1,
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

export default MenuList;
