import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { collection, getDocs, where, query, setDoc, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
  const [menus, setMenus] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const q = query(collection(FIREBASE_DB, 'Menus'), where('chefId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const menusData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      }
    };

    const fetchFavorites = async () => {
      try {
        const docRef = doc(FIREBASE_DB, 'Favorites', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        } else {
          console.log('No favorites found!');
        }
      } catch (error) {
        console.error("Error fetching favorites: ", error);
      }
    };

    fetchMenus();
    fetchFavorites();
  }, [user.uid]);

  const toggleFavorite = async (menuId) => {
    let updatedFavorites = [...favorites];
    if (favorites.includes(menuId)) {
      updatedFavorites = favorites.filter(fav => fav !== menuId);
    } else {
      updatedFavorites.push(menuId);
    }
    setFavorites(updatedFavorites);

    try {
      await setDoc(doc(FIREBASE_DB, 'Favorites', user.uid), { favorites: updatedFavorites });
    } catch (error) {
      console.error("Error updating favorites: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('ViewMenu', { menu: item })} style={styles.menuInfo}>
        <Text style={styles.heading}>{item.heading}</Text>
        <Text style={styles.price}>${item.monthlyPrice}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
        <Icon 
          name={favorites.includes(item.id) ? 'heart' : 'heart-o'} 
          size={24} 
          color={favorites.includes(item.id) ? '#FE660F' : 'gray'} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      <FlatList
        data={menus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateMenu')}>
        <Text style={styles.addButtonText}>Add Menu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
  },
  menuInfo: {
    flex: 1,
    marginRight: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: 'gray',
  },
  addButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
