import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { AppContext } from '../../../others/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../../_utils/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const FavScreen = ({ navigation }) => {
  const { favorites, removeFromFavorites } = useContext(AppContext);
  const [userFavorites, setUserFavorites] = useState([]);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const userFavoritesRef = doc(FIREBASE_DB, 'Favorites', user.uid);
        const docSnap = await getDoc(userFavoritesRef);
        if (docSnap.exists()) {
          setUserFavorites(docSnap.data().favorites || []);
        } else {
          console.log("No favorites document found!");
        }
      };

      fetchFavorites();
    }
  }, [user, favorites]);

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
      <TouchableOpacity onPress={() => removeFromFavorites(item)}>
        <Ionicons name="heart" size={24} color="#FE660F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headingmain}>Favorites</Text>
      {userFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Favorites</Text>
        </View>
      ) : (
      <FlatList
        data={userFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatListContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  headingmain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 20,
    marginTop: -5,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FE660F'
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

export default FavScreen;
