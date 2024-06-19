import React, { useState } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import axios from "axios";

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { confirmPayment } = useStripe();

  const handlePayPress = async () => {
    setLoading(true);

    try {
      // Use your machine's IP address here
      const response = await axios.post(
        "http://10.189.152.186:3000/create-payment-intent",
        {
          amount: 1099, // the amount to charge in cents
        }
      );

      const clientSecret = response.data.clientSecret;

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        setMessage(`Payment confirmation error: ${error.message}`);
      } else if (paymentIntent) {
        setMessage(`Payment successful: ${paymentIntent.id}`);
      }
    } catch (err) {
      setMessage(`Payment error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <CardField
        postalCodeEnabled={true}
        placeholders={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={(cardDetails) => {
          console.log("cardDetails", cardDetails);
        }}
        onFocus={(focusedField) => {
          console.log("focusField", focusedField);
        }}
      />
      <Button onPress={handlePayPress} title="Pay" disabled={loading} />
      {message && <Text>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
});

export default PaymentScreen;
