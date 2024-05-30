
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../../_utils/FirebaseConfig';

const CreateMenu = ({ route, navigation }) => {
  const { menu } = route.params || {};
  const [heading, setHeading] = useState(menu?.heading || '');
  const [items, setItems] = useState(menu?.items || []);
  const [dessert, setDessert] = useState(menu?.dessert || '');
  const [days, setDays] = useState(menu?.days || []);
  const [dailyPrice, setDailyPrice] = useState(menu?.dailyPrice || '');
  const [weeklyPrice, setWeeklyPrice] = useState(menu?.weeklyPrice || '');
  const [monthlyPrice, setMonthlyPrice] = useState(menu?.monthlyPrice || '');
  const [avatars, setAvatars] = useState(menu?.avatars || []);

  useEffect(() => {
    if (typeof days === 'string') {
      setDays(days.split(', '));
    }
  }, [days]);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '', unit: '' }]);
  };

  const handleChoosePhotos = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const newAvatars = await Promise.all(result.assets.map(async (asset) => {
          const { uri } = asset;
          const storageRef = ref(FIREBASE_STORAGE, `menuAvatars/${new Date().getTime()}`);
          const response = await fetch(uri);
          const blob = await response.blob();

          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          return downloadURL;
        }));
        setAvatars([...avatars, ...newAvatars]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photos. Please try again.');
    }
  };

  const handleSaveMenu = async () => {
    const user = FIREBASE_AUTH.currentUser;
    const menuData = {
      heading,
      items,
      dessert,
      days,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      avatars,
      chefId: user.uid,
    };

    try {
      if (menu) {
        // Update existing menu
        const menuDocRef = doc(FIREBASE_DB, 'Menus', menu.id);
        await updateDoc(menuDocRef, menuData);
      } else {
        // Create new menu
        await addDoc(collection(FIREBASE_DB, 'Menus'), menuData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <TextInput
        placeholder="Item Name"
        value={item.name}
        onChangeText={(text) => handleItemChange(index, 'name', text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Quantity"
        value={item.quantity}
        onChangeText={(text) => handleItemChange(index, 'quantity', text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Unit"
        value={item.unit}
        onChangeText={(text) => handleItemChange(index, 'unit', text)}
        style={styles.input}
      />
    </View>
  );

  const renderHeader = () => (
    <View>
      <Text style={styles.heading}>Create Menu</Text>
      <TextInput
        placeholder="Menu Heading"
        value={heading}
        onChangeText={setHeading}
        style={styles.input}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Dessert"
        value={dessert}
        onChangeText={setDessert}
        style={styles.input}
      />
      <TextInput
        placeholder="Available Days (e.g., Monday, Tuesday)"
        value={days.join(', ')}
        onChangeText={(text) => setDays(text.split(', ').map(day => day.trim()))}
        style={styles.input}
      />
      <TextInput
        placeholder="Daily Price"
        value={dailyPrice}
        onChangeText={setDailyPrice}
        style={styles.input}
      />
      <TextInput
        placeholder="Weekly Price"
        value={weeklyPrice}
        onChangeText={setWeeklyPrice}
        style={styles.input}
      />
      <TextInput
        placeholder="Monthly Price"
        value={monthlyPrice}
        onChangeText={setMonthlyPrice}
        style={styles.input}
      />
      <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhotos}>
        <Text style={styles.photoButtonText}>Choose Photos</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {avatars.map((avatar, index) => (
          <Image key={index} source={{ uri: avatar }} style={styles.image} />
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={<Button title="Save Menu" onPress={handleSaveMenu} color="#FE660F" />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  itemContainer: {
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  photoButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
});

export default CreateMenu;
