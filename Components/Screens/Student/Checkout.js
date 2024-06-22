import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import axios from "axios";

const Checkout = ({ route }) => {
  const { cart } = route.params;
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  const totalAmount = cart.reduce((total, item) => total + item.price, 0);

  const handlePayPress = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://10.243.28.127:3000/create-payment-intent",
        {
          amount: totalAmount * 100,
        }
      );

      const { clientSecret } = response.data;

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        type: "Card",
        billingDetails: { name: "Test User" },
      });

      if (error) {
        Alert.alert("Payment failed", error.message);
      } else if (paymentIntent) {
        Alert.alert("Payment successful", `Payment ID: ${paymentIntent.id}`);
      }
    } catch (error) {
      Alert.alert("Payment failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.totalAmount}>Total: ${totalAmount.toFixed(2)}</Text>
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
      />
      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayPress}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? "Processing..." : "Pay Now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EDF3EB",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  totalAmount: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
  payButton: {
    backgroundColor: "#FE660F",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Checkout;
