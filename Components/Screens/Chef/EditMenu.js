import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, Button, SectionList } from 'react-native';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../../_utils/FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateMenu = ({ route, navigation }) => {
  const { menu } = route.params || {};
  const [heading, setHeading] = useState(menu?.heading || '');
  const [items, setItems] = useState(menu?.items || []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [dessert, setDessert] = useState(menu?.dessert || '');
  const [dessertQuantity, setDessertQuantity] = useState('');
  const [dessertDays, setDessertDays] = useState('');
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
    if (newItemName && newItemQuantity) {
      setItems([{ name: newItemName, quantity: newItemQuantity }, ...items]);
      setNewItemName('');
      setNewItemQuantity('');
    } else {
      Alert.alert('Error', 'Please fill in both item name and quantity.');
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uploadedAvatars = await Promise.all(
        result.assets.map(async (asset) => {
          const { uri } = asset;
          const storageRef = ref(FIREBASE_STORAGE, `menuAvatars/${new Date().getTime()}-${Math.random()}`);
          const response = await fetch(uri);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          return await getDownloadURL(storageRef);
        })
      );
      setAvatars([...avatars, ...uploadedAvatars]);
    }
  };

  const handleDeletePhoto = (index) => {
    setAvatars(avatars.filter((_, i) => i !== index));
  };

  const handleSaveMenu = async () => {
    const user = FIREBASE_AUTH.currentUser;
    const menuData = {
      heading,
      items,
      dessert,
      dessertQuantity,
      dessertDays,
      days,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      avatars,
      chefId: user.uid,
    };

    try {
      if (menu) {
        const menuDocRef = doc(FIREBASE_DB, 'Menus', menu.id);
        await updateDoc(menuDocRef, menuData);
      } else {
        await addDoc(collection(FIREBASE_DB, 'Menus'), menuData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text>{item.name} - {item.quantity}</Text>
      <TouchableOpacity onPress={() => handleDeleteItem(index)}>
        <Icon name="delete" size={24} color="#FE660F" />
      </TouchableOpacity>
    </View>
  );

  const sections = [
    {
      title: 'Menu Heading',
      data: [
        <TextInput
          placeholder="Menu Heading"
          value={heading}
          onChangeText={setHeading}
          style={styles.input}
        />,
      ],
    },
    {
      title: 'Add Item',
      data: [
        <View style={styles.itemInputContainer}>
          <TextInput
            placeholder="Item Name"
            value={newItemName}
            onChangeText={setNewItemName}
            style={[styles.input, styles.itemInput]}
          />
          <TextInput
            placeholder="Quantity"
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            style={[styles.input, styles.itemInput]}
            keyboardType='numeric'
          />
          <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>,
        ...items,
      ],
      renderItem: ({ item, index }) => {
        if (index === 0) {
          return item; // Render the input container
        } else {
          return renderItem({ item, index: index - 1 }); // Render the list items
        }
      },
    },
    {
      title: 'Dessert (optional)',
      data: [
        <TextInput
          placeholder="Dessert"
          value={dessert}
          onChangeText={setDessert}
          style={styles.input}
        />,
        <TextInput
          placeholder="Dessert Quantity"
          value={dessertQuantity}
          onChangeText={setDessertQuantity}
          style={styles.input}
        />,
        <TextInput
          placeholder="Dessert Days (e.g., Monday, Tuesday)"
          value={dessertDays}
          onChangeText={setDessertDays}
          style={styles.input}
        />,
      ],
    },
    {
      title: 'Available Days',
      data: [
        <TextInput
          placeholder="Available Days (e.g., Monday, Tuesday)"
          value={days.join(', ')}
          onChangeText={(text) => setDays(text.split(', '))}
          style={styles.input}
        />,
      ],
    },
    {
      title: 'Prices',
      data: [
        <TextInput
          placeholder="Daily Price"
          value={dailyPrice}
          onChangeText={setDailyPrice}
          style={styles.input}
        />,
        <TextInput
          placeholder="Weekly Price"
          value={weeklyPrice}
          onChangeText={setWeeklyPrice}
          style={styles.input}
        />,
        <TextInput
          placeholder="Monthly Price"
          value={monthlyPrice}
          onChangeText={setMonthlyPrice}
          style={styles.input}
        />,
      ],
    },
    {
      title: 'Photos',
      data: [
        <TouchableOpacity onPress={handleChoosePhoto} style={styles.photoButton}>
          <Text style={styles.photoButtonText}>Choose Photos</Text>
        </TouchableOpacity>,
        <View style={styles.imageContainer}>
          {avatars.map((avatar, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: avatar }} style={styles.image} />
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePhoto(index)}>
                <Icon name="delete" size={24} color="#FE660F" />
              </TouchableOpacity>
            </View>
          ))}
        </View>,
      ],
    },
    {
      title: '',
      data: [
        <Button title="Save Menu" onPress={handleSaveMenu} />,
      ],
    },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, section, index }) => section.renderItem ? section.renderItem({ item, index }) : item}
      renderSectionHeader={({ section: { title } }) => (
        title ? <Text style={styles.label}>{title}</Text> : null
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#EDF3EB',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  itemInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FE660F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
  },
  photoButton: {
    backgroundColor: '#FE660F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    margin: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
    padding: 5,
  },
});

export default CreateMenu;
