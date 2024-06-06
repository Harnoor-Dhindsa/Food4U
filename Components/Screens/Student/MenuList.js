import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

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
    backgroundColor: '#FFEDD5',
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
  },
  menuDescription: {
    fontSize: 14,
    color: 'gray',
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
});

export default MenuList;
