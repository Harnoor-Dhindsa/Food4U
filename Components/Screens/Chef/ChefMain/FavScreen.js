import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';

const FavScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [menus, setMenus] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
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

    const fetchMenus = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, 'Menus'));
        const menusData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      }
    };

    fetchFavorites();
    fetchMenus();
  }, [user.uid]);

  const favoriteMenus = menus.filter(menu => favorites.includes(menu.id));

  const renderItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <Text style={styles.heading}>{item.heading}</Text>
      <Text style={styles.price}>${item.monthlyPrice}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      <FlatList
        data={favoriteMenus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
      />
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
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: 'gray',
  },
});

export default FavScreen;
