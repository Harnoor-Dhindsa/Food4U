import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../../_utils/FirebaseConfig';

const EditMenu = ({ route, navigation }) => {
  const { menu } = route.params;
  const [heading, setHeading] = useState(menu?.heading || '');
  const [items, setItems] = useState(menu?.items || []);
  const [dessert, setDessert] = useState(menu?.dessert || '');
  const [days, setDays] = useState(menu?.days || []);
  const [dailyPrice, setDailyPrice] = useState(menu?.dailyPrice || '');
  const [weeklyPrice, setWeeklyPrice] = useState(menu?.weeklyPrice || '');
  const [monthlyPrice, setMonthlyPrice] = useState(menu?.monthlyPrice || '');
  const [avatar, setAvatar] = useState(menu?.avatar || '');

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '', unit: '' }]);
  };

  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const storageRef = ref(FIREBASE_STORAGE, `menuAvatars/${new Date().getTime()}`);
      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setAvatar(downloadURL);
    }
  };

  const handleSaveMenu = async () => {
    const menuData = {
      heading,
      items,
      dessert,
      days,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      avatar,
    };

    try {
      // Update existing menu
      const menuDocRef = doc(FIREBASE_DB, 'Menus', menu.id);
      await updateDoc(menuDocRef, menuData);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Menu</Text>
      <TextInput
        placeholder="Menu Heading"
        value={heading}
        onChangeText={setHeading}
        style={styles.input}
      />
      <FlatList
        data={items}
        renderItem={({ item, index }) => (
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
        )}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>ADD ITEM</Text>
          </TouchableOpacity>
        }
      />
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
      <TouchableOpacity onPress={handleChoosePhoto} style={styles.photoButton}>
        <Text style={styles.photoButtonText}>Choose Photo</Text>
      </TouchableOpacity>
      {avatar ? <Image source={{ uri: avatar }} style={styles.image} /> : null}
      <Button title="Save Menu" onPress={handleSaveMenu} color="#FE660F" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8', // Light background color
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
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
    backgroundColor: '#4CAF50',
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
});

export default EditMenu;
