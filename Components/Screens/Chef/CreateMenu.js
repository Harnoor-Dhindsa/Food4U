
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
  const [heading, setHeading] = useState(menu?.heading || "");
  const [items, setItems] = useState(menu?.items || []);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [dessert, setDessert] = useState(menu?.dessert || "");
  const [dessertQuantity, setDessertQuantity] = useState("");
  const [dessertDays, setDessertDays] = useState("");
  const [days, setDays] = useState(menu?.days || []);
  const [dailyPrice, setDailyPrice] = useState(menu?.dailyPrice || "");
  const [weeklyPrice, setWeeklyPrice] = useState(menu?.weeklyPrice || "");
  const [monthlyPrice, setMonthlyPrice] = useState(menu?.monthlyPrice || "");
  const [avatars, setAvatars] = useState(menu?.avatars || []);
  const [pickup, setPickup] = useState(menu?.pickup || false);
  const [pickupAddress, setPickupAddress] = useState(menu?.pickupAddress || "");
  const [delivery, setDelivery] = useState(menu?.delivery || false);

  useEffect(() => {
    if (typeof days === "string") {
      setDays(days.split(", "));
    }
  }, [days]);

  const handleAddItem = () => {
    if (newItemName && newItemQuantity) {
      setItems([{ name: newItemName, quantity: newItemQuantity }, ...items]);
      setNewItemName("");
      setNewItemQuantity("");
    } else {
      Alert.alert("Error", "Please fill in both item name and quantity.");
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
          const storageRef = ref(
            FIREBASE_STORAGE,
            `menuAvatars/${new Date().getTime()}-${Math.random()}`
          );
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
  if (
    heading.trim() === "" ||
    items.length < 3 ||
    days.length === 0 ||
    dailyPrice.trim() === "" ||
    weeklyPrice.trim() === "" ||
    monthlyPrice.trim() === "" ||
    (!pickup && !delivery) ||
    (pickup && pickupAddress.trim() === "") ||
    (dessert && (!dessertQuantity || !dessertDays))
  ) {
    Alert.alert(
      "Error",
      "Please fill in all required fields and ensure at least 3 items are added. If you provide a dessert, make sure to enter quantity and days."
    );
    return;
  }

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
    createdAt: menu ? menu.createdAt : new Date(),
    updatedAt: new Date(),
    pickup,
    pickupAddress: pickup ? pickupAddress : "",
    delivery,
  };

  try {
    if (menu) {
      const menuDocRef = doc(FIREBASE_DB, "PendingMenus", menu.id);
      await updateDoc(menuDocRef, menuData);
    } else {
      await addDoc(collection(FIREBASE_DB, "PendingMenus"), menuData);
    }
    navigation.goBack();
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text>
        {item.name} - {item.quantity}
      </Text>
      <TouchableOpacity onPress={() => handleDeleteItem(index)}>
        <Icon name="delete" size={24} color="#FE660F" />
      </TouchableOpacity>
    </View>
  );

  const sections = [
    {
      title: "Menu Heading *",
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
      title: "Add Item *",
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
            keyboardType="numeric"
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
      title: "Dessert (optional)",
      data: [
        <TextInput
          placeholder="Dessert"
          value={dessert}
          onChangeText={(text) => setDessert(text)}
          style={styles.input}
        />,
        dessert ? (
          <>
            <TextInput
              placeholder="Dessert Quantity"
              value={dessertQuantity}
              onChangeText={setDessertQuantity}
              style={styles.input}
            />
            <TextInput
              placeholder="Dessert Days (e.g., Monday, Tuesday)"
              value={dessertDays}
              onChangeText={setDessertDays}
              style={styles.input}
            />
          </>
        ) : null,
      ],
    },

    {
      title: "Available Days *",
      data: [
        <TextInput
          placeholder="Available Days (e.g., Monday, Tuesday)"
          value={days.join(", ")}
          onChangeText={(text) => setDays(text.split(", "))}
          style={styles.input}
        />,
      ],
    },
    {
      title: "Prices *",
      data: [
        <TextInput
          placeholder="Daily Price"
          value={dailyPrice}
          onChangeText={setDailyPrice}
          style={styles.input}
          keyboardType="numeric"
        />,
        <TextInput
          placeholder="Weekly Price"
          value={weeklyPrice}
          onChangeText={setWeeklyPrice}
          style={styles.input}
          keyboardType="numeric"
        />,
        <TextInput
          placeholder="Monthly Price"
          value={monthlyPrice}
          onChangeText={setMonthlyPrice}
          style={styles.input}
          keyboardType="numeric"
        />,
      ],
    },
    {
      title: "Photos",
      data: [
        <TouchableOpacity
          onPress={handleChoosePhoto}
          style={styles.photoButton}
        >
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
      title: "Pickup or Delivery *",
      data: [
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[styles.optionButton, pickup && styles.selectedOption]}
            onPress={() => setPickup(!pickup)}
          >
            <Text
              style={[styles.optionText, pickup && styles.selectedOptionText]}
            >
              Pickup
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, delivery && styles.selectedOption]}
            onPress={() => setDelivery(!delivery)}
          >
            <Text
              style={[styles.optionText, delivery && styles.selectedOptionText]}
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>,
        pickup && (
          <TextInput
            placeholder="Pickup Address *"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            style={styles.input}
          />
        ),
      ],
      renderItem: ({ item }) => (item ? item : null),
    },
    {
      title: "Save Menu",
      data: [
        <TouchableOpacity onPress={handleSaveMenu} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Create Menu</Text>
        </TouchableOpacity>,
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index, section }) => {
          if (section.title === "Save Menu") {
            return item; // Render the save button
          }
          return item; // Render all other items
        }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
  itemInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  itemInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#FE660F",
    borderRadius: 5,
    marginLeft: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  photoButton: {
    backgroundColor: "#FE660F",
    borderRadius: 5,
    margin: 10,
    padding: 10,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    margin: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  footerSpace: {
    height: 50,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    margin: 5,
    borderColor: "#FE660F",
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "#fff", // Default background color
  },
  selectedOption: {
    backgroundColor: "#FE660F", // Updated selected color
  },
  optionText: {
    color: "#FE660F", // Default text color
  },
  selectedOptionText: {
    color: "#fff", // Text color for selected option
  },
  saveButton: {
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 5,
    margin: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateMenu;

     
