import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../_utils/FirebaseConfig";
import { Checkbox } from "react-native-paper";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SaveMenu = ({ route, navigation }) => {
  const { title, items, dessert } = route.params;
  const [days, setDays] = useState([]);
  const [oneTimePrice, setOneTimePrice] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveMenu = async () => {
    if (!monthlyPrice) {
      Alert.alert("Error", "Monthly price is required.");
      return;
    }

    setLoading(true);
    const user = FIREBASE_AUTH.currentUser;
    const menuData = {
      title,
      items,
      dessert,
      days,
      oneTimePrice: oneTimePrice ? `$${oneTimePrice}` : "",
      weeklyPrice: weeklyPrice ? `$${weeklyPrice}` : "",
      monthlyPrice: `$${monthlyPrice}`,
      chefId: user.uid,
    };

    try {
      await addDoc(collection(FIREBASE_DB, "Menus"), menuData);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Save Menu</Text>
      <Text style={styles.subHeading}>Available Days</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayItem}>
            <Checkbox
              status={days.includes(day) ? "checked" : "unchecked"}
              onPress={() => toggleDay(day)}
            />
            <Text>{day}</Text>
          </View>
        ))}
      </View>
      <TextInput
        placeholder="One-Time Price"
        value={oneTimePrice}
        onChangeText={setOneTimePrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Weekly Price"
        value={weeklyPrice}
        onChangeText={setWeeklyPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Monthly Price (Required)"
        value={monthlyPrice}
        onChangeText={setMonthlyPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveMenu}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.saveButtonText}>Save Menu</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
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
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  saveButton: {
    backgroundColor: "#FE660F",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginVertical: 20,
  },
  saveButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default SaveMenu;
