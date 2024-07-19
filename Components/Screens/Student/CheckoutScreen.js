import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedMenu } = route.params || {};
  const { price, chefStripeAccountId } = selectedMenu || {};
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  useEffect(() => {
    const initializePaymentSheet = async () => {
      if (!selectedMenu) {
        Alert.alert("Error", "No menu selected");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("http://192.168.1.74:3000/payment-sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseInt(price) * 100, // Ensure amount is in cents
            currency: "usd",
            chefStripeAccountId: chefStripeAccountId,
          }),
        });

        const data = await response.json();
        console.log("Response data:", data); // Log the response data

        const { paymentIntent, ephemeralKey, customer } = data;

        if (!paymentIntent) {
          throw new Error("PaymentIntent is missing in the response.");
        }

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          ephemeralKeySecret: ephemeralKey,
          customerId: customer,
          returnURL: "your-app://return-url", // Ensure this URL is correct
          merchantDisplayName: "Your Merchant Name", // Add your merchant display name here
        });

        if (initError) {
          throw new Error(initError.message);
        } else {
          setPaymentInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing payment sheet:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to initialize payment sheet.");
      } finally {
        setLoading(false);
      }
    };

    initializePaymentSheet();
  }, [initPaymentSheet, price, chefStripeAccountId, selectedMenu]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        throw new Error(error.message);
      } else {
        Alert.alert("Success", "Payment successful!");
        navigation.navigate("Success");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Checkout</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        paymentInitialized && (
          <>
            <Text>Price: ${price}</Text>
            <Button title="Pay" onPress={handlePayment} />
          </>
        )
      )}
    </View>
  );
};

export default () => (
  <StripeProvider publishableKey="pk_test_51POuNq2KqukMgC6pFkXCoiuutre7lxD0SiP00uRdvNFecGzQMuAX9bJsFlC3Jklgr94eOkWnp2m6GH27l3ijdSoL00DIkImryA">
    <Checkout />
  </StripeProvider>
);
