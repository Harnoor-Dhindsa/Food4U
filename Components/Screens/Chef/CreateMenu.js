import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, SectionList, Platform, SafeAreaView } from 'react-native';
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
  const [pickup, setPickup] = useState(menu?.pickup || false);
  const [pickupAddress, setPickupAddress] = useState(menu?.pickupAddress || '');
  const [delivery, setDelivery] = useState(menu?.delivery || false);

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
      createdAt: menu ? menu.createdAt : new Date(),  // Set creation date if it is a new menu
      updatedAt: new Date(),  // Update date for both new and existing menus
      pickup,
      pickupAddress: pickup ? pickupAddress : '',
      delivery,
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
            <Image key={index} source={{ uri: avatar }} style={styles.image} />
          ))}
        </View>,
      ],
    },
    {
      title: 'Pickup and Delivery',
      data: [
        <View style={styles.optionContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, pickup && styles.selectedOption]}
            onPress={() => setPickup(!pickup)}
          >
            <Text style={styles.optionText}>Pickup</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.optionButton, delivery && styles.selectedOption]}
            onPress={() => setDelivery(!delivery)}
          >
            <Text style={styles.optionText}>Delivery</Text>
          </TouchableOpacity>
        </View>,
        pickup && (
          <TextInput
            placeholder="Pickup Address"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            style={styles.input}
          />
        ),
      ],
      renderItem: ({ item }) => (item ? item : null),
    },
    {
      title: '',
      data: [
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMenu}>
          <Text style={styles.saveButtonText}>Save Menu</Text>
        </TouchableOpacity>,
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <View style={styles.item}>{item}</View>}
        renderSectionHeader={({ section: { title } }) => (
          title ? <Text style={styles.sectionHeader}>{title}</Text> : null
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  itemInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#FE660F',
    borderRadius: 4,
    padding: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    marginVertical: 4,
    borderRadius: 4,
  },
  photoButton: {
    backgroundColor: '#FE660F',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  image: {
    width: 100,
    height: 100,
    margin: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#FE660F',
  },
  optionText: {
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#FE660F',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateMenu;
