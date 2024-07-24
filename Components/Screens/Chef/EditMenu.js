import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, SectionList, Platform } from 'react-native';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../../_utils/FirebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditMenu = ({ route, navigation }) => {
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
  const [pickup, setPickup] = useState(menu?.pickup || false);
  const [pickupAddress, setPickupAddress] = useState(menu?.pickupAddress || '');
  const [delivery, setDelivery] = useState(menu?.delivery || false);
  const [deliveryDetails, setDeliveryDetails] = useState(menu?.deliveryDetails || '');

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
      pickup,
      pickupAddress,
      delivery,
      deliveryDetails,
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
      title: 'Pickup and Delivery',
      data: [
        <View style={styles.optionContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, pickup && styles.optionSelected]} 
            onPress={() => setPickup(!pickup)}
          >
            <Text style={styles.optionText}>Pickup</Text>
          </TouchableOpacity>
          {pickup && (
            <TextInput
              placeholder="Pickup Address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              style={styles.input}
            />
          )}
        </View>,
        <View style={styles.optionContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, delivery && styles.optionSelected]} 
            onPress={() => setDelivery(!delivery)}
          >
            <Text style={styles.optionText}>Delivery</Text>
          </TouchableOpacity>
        </View>,
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
  ];

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => item}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
      <TouchableOpacity onPress={handleSaveMenu} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#FE660F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  itemInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#FE660F',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  optionContainer: {
    marginBottom: 10,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
  },
  optionSelected: {
    backgroundColor: '#FE660F',
    borderColor: '#FE660F',
  },
  optionText: {
    color: '#fff',
  },
  photoButton: {
    backgroundColor: '#FE660F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  saveButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditMenu;
