import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  SectionList,
  SafeAreaView,
} from "react-native";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../_utils/FirebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FIREBASE_STORAGE } from "../../../_utils/FirebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";

const EditMenu = ({ route, navigation }) => {
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
        const menuDocRef = doc(FIREBASE_DB, "Menus", menu.id);
        await updateDoc(menuDocRef, menuData);
      } else {
        await addDoc(collection(FIREBASE_DB, "Menus"), menuData);
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
          key="menuHeading"
          placeholder="Menu Heading"
          value={heading}
          onChangeText={setHeading}
          style={[styles.input, styles.headingInput]}
        />,
      ],
    },
    {
      title: "Add Item *",
      data: [
        <View key="addItemContainer" style={styles.itemInputContainer}>
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
        ...items.map((item, index) => renderItem({ item, index })),
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
          key="dessert"
          placeholder="Dessert"
          value={dessert}
          onChangeText={(text) => setDessert(text)}
          style={styles.input}
        />,
        dessert ? (
          <>
            <TextInput
              key="dessertQuantity"
              placeholder="Dessert Quantity"
              value={dessertQuantity}
              onChangeText={setDessertQuantity}
              style={styles.input}
            />
            <TextInput
              key="dessertDays"
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
          key="availableDays"
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
          key="dailyPrice"
          placeholder="Daily Price"
          value={dailyPrice}
          onChangeText={setDailyPrice}
          style={styles.input}
          keyboardType="numeric"
        />,
        <TextInput
          key="weeklyPrice"
          placeholder="Weekly Price"
          value={weeklyPrice}
          onChangeText={setWeeklyPrice}
          style={styles.input}
          keyboardType="numeric"
        />,
        <TextInput
          key="monthlyPrice"
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
          key="choosePhotos"
          onPress={handleChoosePhoto}
          style={styles.photoButton}
        >
          <Text style={styles.photoButtonText}>Choose Photos</Text>
        </TouchableOpacity>,
        <View key="imageContainer" style={styles.imageContainer}>
          {avatars.map((avatar, index) => (
            <Image key={index} source={{ uri: avatar }} style={styles.image} />
          ))}
        </View>,
      ],
    },
    {
      title: "Delivery Options",
      data: [
        <View key="deliveryOptions" style={styles.optionContainer}>
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
            key="pickupAddress"
            placeholder="Pickup Address *"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            style={styles.input}
          />
        ),
      ],
    },
    {
      title: "Save Menu",
      data: [
        <TouchableOpacity
          key="saveMenu"
          onPress={handleSaveMenu}
          style={styles.saveButton}
        >
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
    backgroundColor: "#f5f5f5",
  },
  input: {
    height: 45,
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  headingInput: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
  },
  itemInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#FE660F",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  photoButton: {
    backgroundColor: "#FE660F",
    borderRadius: 8,
    margin: 12,
    padding: 12,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    margin: 12,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#eee",
    padding: 12,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    margin: 5,
    borderColor: "#FE660F",
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedOption: {
    backgroundColor: "#FE660F",
  },
  optionText: {
    color: "#FE660F",
  },
  selectedOptionText: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#FE660F",
    padding: 16,
    borderRadius: 8,
    margin: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditMenu;