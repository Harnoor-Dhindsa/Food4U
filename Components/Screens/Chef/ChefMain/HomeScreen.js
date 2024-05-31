import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  const [menus, setMenus] = useState([]);
  const user = FIREBASE_AUTH.currentUser;
  const [refreshing, setRefreshing] = useState(false);

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

    fetchMenus();
  }, [user.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const fetchMenus = async () => {
      try {
        const q = query(collection(FIREBASE_DB, 'Menus'), where('chefId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const menusData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchMenus();
  }, [user.uid]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('ViewMenu', { menu: item })}>
      <View>
        <Text style={styles.heading}>{item.heading}</Text>
        <Text style={styles.days}>{item.days.join(', ')}</Text>
      </View>
      <Text style={styles.price}>${item.monthlyPrice}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <FlatList
        data={menus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateMenu')}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  container: {
    padding: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FE660F' // Light orange background
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  days: {
    fontSize: 14,
    color: 'gray',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE660F', // Orange color for price
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FE660F', // Orange color for the button
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default HomeScreen;
