import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import axios from "axios";

const Checkout = ({ route, navigation }) => {
  const { clientSecret, ephemeralKey, customerId } = route.params;
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch ephemeral key and set it
    fetchEphemeralKey();
  }, []);

  const fetchEphemeralKey = async () => {
    try {
      await confirmPayment(clientSecret, {
        type: "Card",
        billingDetails: {
          email: "customer@example.com",
        },
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      // Handle error, show message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={{
          backgroundColor: "#FFFFFF",
          textColor: "#000000",
        }}
        style={styles.cardField}
        onCardChange={(cardDetails) => {
          console.log("cardDetails", cardDetails);
        }}
        onFocus={(focusedField) => {
          console.log("focusField", focusedField);
        }}
      />
      <TouchableOpacity
        style={styles.payButton}
        onPress={fetchEphemeralKey}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cardField: {
    width: "100%",
    height: 50,
    marginVertical: 10,
  },
  payButton: {
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Checkout;
