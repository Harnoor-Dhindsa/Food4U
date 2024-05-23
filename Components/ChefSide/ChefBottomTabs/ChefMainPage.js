import React, { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ScrollView,Button,Image,} from "react-native";
import { FIREBASE_DB } from "../../../_utils/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { FIREBASE_AUTH } from "../../../_utils/FirebaseConfig";

const ChefMainPage = () => {
  const [dishName, setDishName] = useState("");
  const [dishes, setDishes] = useState([]);
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [image, setImage] = useState(null);

  const handleAddDish = () => {
    setDishes([...dishes, { name: dishName, image: image }]);
    setDishName("");
    setImage(null);
  };

  const handleChoosePhoto = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (!pickerResult.cancelled) {
      setImage(pickerResult.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const docRef = doc(FIREBASE_DB, "ChefMenus", user.uid);
      await setDoc(docRef, {
        dishes,
        monthlyPayment,
        createdAt: new Date(),
      });
      alert("Menu saved successfully!");
    } else {
      alert("User not logged in");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Upload Menu</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dish Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter dish name"
          value={dishName}
          onChangeText={setDishName}
        />
      </View>
      <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhoto}>
        <Text style={styles.photoButtonText}>Choose Photo</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
        <Text style={styles.addButtonText}>Add Dish</Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Monthly Payment</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter total monthly payment"
          value={monthlyPayment}
          onChangeText={setMonthlyPayment}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Menu</Text>
      </TouchableOpacity>
      <View style={styles.dishesContainer}>
        {dishes.map((dish, index) => (
          <View key={index} style={styles.dishItem}>
            <Text>{dish.name}</Text>
            {dish.image && (
              <Image source={{ uri: dish.image }} style={styles.dishImage} />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#EDF3EB",
    padding: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: "15%",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  photoButton: {
    backgroundColor: "#FE660F",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  photoButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dishesContainer: {
    width: "100%",
    marginTop: 20,
  },
  dishItem: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default ChefMainPage;
