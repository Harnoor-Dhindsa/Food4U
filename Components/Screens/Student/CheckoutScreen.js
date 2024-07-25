import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { AppContext } from "../../others/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../_utils/FirebaseConfig";
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedMenu } = route.params || {};
  const { cart, removeFromCart } = useContext(AppContext);
  const { price, chefStripeAccountId, pickupAddress, delivery, chefId, heading, days } = selectedMenu || {};
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [chosenPlan, setChosenPlan] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");

  useEffect(() => {
    if (selectedMenu) {
      setChosenPlan(selectedMenu.selectedPlan);
      setTotalPrice(selectedMenu.price);
    }
  }, [selectedMenu]);

  useEffect(() => {
    const initializePaymentSheet = async () => {
      if (!selectedMenu) {
        Alert.alert("Error", "No menu selected");
        return;
      }

      try {
        const response = await fetch("http://192.168.1.74:3000/payment-sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseInt(price) * 100, // Ensure amount is in cents
            currency: "cad",
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
        Alert.alert("Error", "Failed to initialize payment sheet.");
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
  
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const { uid, displayName, email } = user;
  
          // Assuming firstName and lastName are stored as custom claims or in the Firestore user document
          const userDoc = await getDoc(doc(FIREBASE_DB, "StudentsProfiles", uid));
          const { firstName, lastName } = userDoc.data() || {};
  
          if (!firstName || !lastName) {
            throw new Error("User's first name or last name is missing.");
          }
  
          await addDoc(collection(FIREBASE_DB, "orders"), {
            days,
            heading,
            chefId,
            firstName,
            lastName,
            chosenPlan,
            totalPrice,
            selectedOption,
            deliveryDetails: selectedOption === "delivery" ? deliveryDetails : pickupAddress,
            email,
            createdAt: new Date(),
          });
  
          navigation.goBack();
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FE660F" />
        </TouchableOpacity>
        <Text style={styles.heading}>Checkout</Text>
      </View>
      <Text style={styles.sectionTitle}>Chosen Menu</Text>
    </>
  );

  const renderFooter = () => (
    <>
      <Text style={styles.sectionTitle}>Chosen Plan</Text>
      <View style={styles.planContainer}>
        <Text style={styles.planText}>{chosenPlan}</Text>
      </View>
      <Text style={styles.totalPrice}>Total Price: ${totalPrice}</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <FlatList
        ListHeaderComponent={renderHeader}
        data={selectedMenu.items}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContainer}
      />
      <View style={styles.deliveryOptionsContainer}>
        <Text style={styles.deliveryOptionsTitle}>Delivery Options</Text>
        {pickupAddress && (
          <TouchableOpacity
            style={[styles.optionButton, selectedOption === "pickup" && styles.selectedOptionButton]}
            onPress={() => setSelectedOption("pickup")}
          >
            <Text style={styles.optionText}>Pickup</Text>
          </TouchableOpacity>
        )}
        {delivery && (
          <TouchableOpacity
            style={[styles.optionButton, selectedOption === "delivery" && styles.selectedOptionButton]}
            onPress={() => setSelectedOption("delivery")}
          >
            <Text style={styles.optionText}>Delivery</Text>
          </TouchableOpacity>
        )}
        {selectedOption === "pickup" && pickupAddress && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Pickup Address:</Text>
            <Text style={styles.addressText}>{pickupAddress}</Text>
          </View>
        )}
        {selectedOption === "delivery" && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Delivery Address:</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter delivery address"
              value={deliveryDetails}
              onChangeText={setDeliveryDetails}
            />
          </View>
        )}
      </View>
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FE660F" />
        ) : (
          paymentInitialized && (
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={handlePayment}
              disabled={selectedOption === "delivery" && !deliveryDetails}
            >
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF3EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#EDF3EB",
  },
  backButton: {
    padding: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    marginLeft: 16,
    color: "#FE660F",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  itemName: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  planContainer: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
  },
  planText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
    textAlign: "center",
    marginVertical: 16,
  },
  deliveryOptionsContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  deliveryOptionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  optionButton: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  selectedOptionButton: {
    borderColor: "#FE660F",
    backgroundColor: "#FFE5D1",
  },
  optionText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  addressContainer: {
    marginTop: 16,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#4A4A4A",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFF",
  },
  placeOrderButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FE660F",
    alignItems: "center",
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default () => (
  <StripeProvider publishableKey="pk_test_51POuNq2KqukMgC6pFkXCoiuutre7lxD0SiP00uRdvNFecGzQMuAX9bJsFlC3Jklgr94eOkWnp2m6GH27l3ijdSoL00DIkImryA">
    <Checkout />
  </StripeProvider>
);
