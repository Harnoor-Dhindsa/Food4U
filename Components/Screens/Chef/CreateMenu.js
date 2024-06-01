import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../../../_utils/FirebaseConfig";

const CreateMenu = ({ navigation }) => {
  const [heading, setHeading] = useState("");
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [dessert, setDessert] = useState("");
  const [dessertQuantity, setDessertQuantity] = useState("");
  const [dessertDays, setDessertDays] = useState("");
  const buttonAnim = new Animated.Value(1);

  const handleAddItem = () => {
    if (newItemName && newItemQuantity) {
      setItems([...items, { name: newItemName, quantity: newItemQuantity }]);
      setNewItemName("");
      setNewItemQuantity("");
    } else {
      Alert.alert("Error", "Please fill in both item name and quantity.");
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!heading) {
      Alert.alert("Error", "Please provide a menu heading.");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Error", "Please add at least one item.");
      return;
    }

    const menuData = {
      heading,
      items,
      dessert,
      dessertQuantity,
      dessertDays: dessertDays.split(", "),
      chefId: FIREBASE_AUTH.currentUser.uid,
    };

    navigation.navigate("ReviewMenu", { menuData });
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.heading}>Create Your Menu</Text>
        <Text style={styles.subheading}>Fill in the details below</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="fast-food"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Menu Heading"
            value={heading}
            onChangeText={setHeading}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="restaurant"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.itemsScrollView}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteItem(index)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <Ionicons
            name="ice-cream"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Dessert (optional)"
            value={dessert}
            onChangeText={setDessert}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={dessertQuantity}
            onChangeText={setDessertQuantity}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Dessert Availability Days (e.g., Friday)"
            value={dessertDays}
            onChangeText={setDessertDays}
          />
        </View>
        <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              animateButton();
              handleNext();
            }}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EDF3EB",
  },
  heading: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333333",
  },
  subheading: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10, // Increased margin for better spacing
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333333",
  },
  addButton: {
    backgroundColor: "#FE660F",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsScrollView: {
    maxHeight: 200, // Limited height for scroll view
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  itemName: {
    fontSize: 14, // Smaller font size for item name
    color: "#333333",
  },
  itemQuantity: {
    fontSize: 14, // Smaller font size for item quantity
    color: "#333333",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FE660F",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateMenu;
