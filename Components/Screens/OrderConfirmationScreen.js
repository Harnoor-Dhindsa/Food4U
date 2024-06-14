import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { menu, selectedPlan } = route.params;

  const getPlanPrice = (plan) => {
    switch (plan) {
      case "daily":
        return `$${menu.dailyPrice}`;
      case "weekly":
        return `$${menu.weeklyPrice}`;
      case "monthly":
        return `$${menu.monthlyPrice}`;
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FE660F" />
        </TouchableOpacity>
        <Text style={styles.heading}>Order Confirmation</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subheading}>{menu.heading}</Text>
        <Text style={styles.text}>Selected Plan: {selectedPlan}</Text>
        <Text style={styles.text}>Price: {getPlanPrice(selectedPlan)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("MenuDetail", { menu })}
        >
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("PaymentScreen", { menu, selectedPlan })}
        >
          <Text style={styles.buttonText}>Confirm Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF3EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#EDF3EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  subheading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FE660F",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default OrderConfirmationScreen;
