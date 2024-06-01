import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, collection } from "firebase/firestore";
import { FIREBASE_DB } from "../../../_utils/FirebaseConfig";

const ReviewMenu = ({ route, navigation }) => {
  const { menuData } = route.params;
  const [oneTimePrice, setOneTimePrice] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [menuAvailability, setMenuAvailability] = useState("");
  const buttonAnim = new Animated.Value(1);

  const handleSubmit = async () => {
    if (!oneTimePrice || !weeklyPrice || !monthlyPrice || !menuAvailability) {
      Alert.alert(
        "Error",
        "Please fill in all the price fields and availability."
      );
      return;
    }

    try {
      const newMenu = {
        ...menuData,
        oneTimePrice,
        weeklyPrice,
        monthlyPrice,
        menuAvailability,
      };

      const menuRef = doc(collection(FIREBASE_DB, "menus"));
      await setDoc(menuRef, newMenu);

      Alert.alert("Success", "Menu created successfully!");
      navigation.navigate("ChefProfile");
    } catch (error) {
      console.error("Error creating menu: ", error);
      Alert.alert("Error", "Failed to create menu. Please try again.");
    }
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
      <Text style={styles.heading}>Review Your Menu</Text>
      <Text style={styles.subheading}>Ensure all details are correct</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu Heading</Text>
        <Text style={styles.sectionContent}>{menuData.heading}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {menuData.items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
          </View>
        ))}
      </View>
      {menuData.dessert ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dessert</Text>
          <Text style={styles.sectionContent}>
            {menuData.dessert} - {menuData.dessertQuantity}
          </Text>
          <Text style={styles.sectionContent}>
            Available on: {menuData.dessertDays.join(", ")}
          </Text>
        </View>
      ) : null}
      <View style={styles.inputContainer}>
        <Ionicons name="cash" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="One Time Price"
          value={oneTimePrice}
          onChangeText={setOneTimePrice}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="calendar" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Weekly Price"
          value={weeklyPrice}
          onChangeText={setWeeklyPrice}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="calendar" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Monthly Price"
          value={monthlyPrice}
          onChangeText={setMonthlyPrice}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="time" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Menu Availability"
          value={menuAvailability}
          onChangeText={setMenuAvailability}
        />
      </View>
      <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            animateButton();
            handleSubmit();
          }}
        >
          <Text style={styles.buttonText}>Submit Menu</Text>
        </TouchableOpacity>
      </Animated.View>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333333",
  },
  sectionContent: {
    fontSize: 16,
    color: "#333333",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
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

export default ReviewMenu;
