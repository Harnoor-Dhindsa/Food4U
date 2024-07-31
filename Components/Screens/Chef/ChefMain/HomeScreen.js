import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, RefreshControl, Alert, FlatList, Modal } from 'react-native';
import { collection, getDocs, where, query, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const user = FIREBASE_AUTH.currentUser;
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchMenus();
  }, [user.uid]);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus().finally(() => setRefreshing(false));
  }, [user.uid]);

  const handleDeleteMenu = async () => {
    if (selectedMenuId) {
      try {
        await deleteDoc(doc(FIREBASE_DB, 'Menus', selectedMenuId));
        setMenus(menus.filter(menu => menu.id !== selectedMenuId));
        setModalVisible(false);
      } catch (error) {
        console.error("Error deleting menu: ", error);
      }
    }
  };

  const handleLongPress = (menuId) => {
    setSelectedMenuId(menuId);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuContainer}
      onPress={() => navigation.navigate('ViewMenu', { menu: item })}
      onLongPress={() => handleLongPress(item.id)}
    >
      <View style={styles.menuContent}>
        <View>
          <Text style={styles.heading}>{item.heading}</Text>
          <Text style={styles.days}>{item.days.join(', ')}</Text>
        </View>
        <Text style={styles.price}>${item.monthlyPrice}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <Text style={styles.headingmain}>Menus</Text>
      <FlatList
        data={menus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.container}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateMenu')}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Do you want to delete this menu?</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleDeleteMenu}
            >
              <Text style={styles.modalButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 3,
    borderBottomColor: '#FE660F',
    alignItems: 'center',
  },
  headingmain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginLeft: 20,
    marginTop: 20,
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE660F',
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FE660F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  days: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE660F',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FE660F',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#FE660F',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FE660F',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#FE660F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;