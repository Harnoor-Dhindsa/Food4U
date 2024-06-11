import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { AppContext } from "../../others/AppContext";

const Checkout = ({ route, navigation }) => {
  const { menu } = route.params;
  const { confirmPayment } = useStripe();
  const { removeFromCart } = useContext(AppContext);

  const handlePayment = async () => {
    try {
      const response = await fetch(
        "http://localhost:4242/create-payment-intent", // Use your backend URL here
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: menu.price * 100, // Convert to cents
          }),
        }
      );
      const { clientSecret } = await response.json();

      const { error } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Payment failed", error.message);
      } else {
        Alert.alert(
          "Payment successful",
          "Your order has been placed successfully."
        );
        removeFromCart(menu);
        navigation.navigate("Cart");
      }
    } catch (error) {
      Alert.alert("Payment error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        {menu.avatars && menu.avatars.length > 0 ? (
          <Image
            source={{ uri: menu.avatars[0] }}
            style={styles.image}
            onError={(e) => console.log(e.nativeEvent.error)}
          />
        ) : null}
        <View style={styles.infoContainer}>
          <Text style={styles.menuTitle}>{menu.heading}</Text>
          <Text style={styles.menuDescription}>{menu.days.join(", ")}</Text>
          <Text style={styles.itemPlan}>
            Selected Plan: {menu.selectedPlan}
          </Text>
          <Text style={styles.menuPrice}>${menu.price}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
        <Text style={styles.paymentButtonText}>Go to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF3EB",
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFEDD5",
    borderColor: "#FE660F",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuDescription: {
    fontSize: 14,
    color: "gray",
  },
  itemPlan: {
    fontSize: 16,
    color: "#666",
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE660F",
    marginLeft: 10,
  },
  paymentButton: {
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default Checkout;
