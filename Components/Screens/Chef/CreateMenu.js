import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../_utils/FirebaseConfig";
import { FontAwesome } from "@expo/vector-icons";

const CreateMenu = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ name: "", quantity: "" });
  const [currentDessert, setCurrentDessert] = useState({
    name: "",
    quantity: "",
  });

  const handleAddItem = async () => {
    if (!currentItem.name || !currentItem.quantity) {
      Alert.alert("Error", "Please enter both item name and quantity.");
      return;
    }

    const user = FIREBASE_AUTH.currentUser;
    const newItem = { ...currentItem, chefId: user.uid };

    try {
      const docRef = await addDoc(
        collection(FIREBASE_DB, "MenuItems"),
        newItem
      );
      setItems([...items, { ...newItem, id: docRef.id }]);
      setCurrentItem({ name: "", quantity: "" });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "MenuItems", id));
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleNext = () => {
    navigation.navigate("SaveMenu", { title, items, dessert: currentDessert });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Menu</Text>
      <TextInput
        placeholder="Menu Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <Text style={styles.label}>Add Item</Text>
      <View style={styles.itemRow}>
        <TextInput
          placeholder="Item Name"
          value={currentItem.name}
          onChangeText={(name) => setCurrentItem({ ...currentItem, name })}
          style={[styles.input, styles.itemInput]}
        />
        <TextInput
          placeholder="Quantity"
          value={currentItem.quantity}
          onChangeText={(quantity) =>
            setCurrentItem({ ...currentItem, quantity })
          }
          style={[styles.input, styles.quantityInput]}
        />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>
              {item.name} - {item.quantity}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
              <FontAwesome name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <Text style={styles.label}>Add Dessert (Optional)</Text>
      <View style={styles.itemRow}>
        <TextInput
          placeholder="Dessert Name"
          value={currentDessert.name}
          onChangeText={(name) =>
            setCurrentDessert({ ...currentDessert, name })
          }
          style={[styles.input, styles.itemInput]}
        />
        <TextInput
          placeholder="Quantity"
          value={currentDessert.quantity}
          onChangeText={(quantity) =>
            setCurrentDessert({ ...currentDessert, quantity })
          }
          style={[styles.input, styles.quantityInput]}
        />
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EDF3EB",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FE660F",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: "white",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInput: {
    flex: 2,
    marginRight: 10,
  },
  quantityInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#FE660F",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  nextButton: {
    backgroundColor: "#FE660F",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginVertical: 20,
  },
  nextButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default CreateMenu;
