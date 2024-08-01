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
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedMenu } = route.params || {};
  const { cart, removeFromCart } = useContext(AppContext);
  const {
    price,
    chefStripeAccountId,
    pickupAddress,
    delivery,
    chefId,
    heading,
    days,
  } = selectedMenu || {};
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
      setTotalPrice(Number(selectedMenu.price)); // Ensure price is treated as a number
    }
  }, [selectedMenu]);

  useEffect(() => {
    const initializePaymentSheet = async () => {
      if (!selectedMenu) {
        Alert.alert("Error", "No menu selected");
        return;
      }

      try {
        const response = await fetch(
          "http://10.189.129.43:3000/payment-sheet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: parseInt(price) * 100, // Ensure amount is in cents
              currency: "cad",
              chefStripeAccountId: chefStripeAccountId,
            }),
          }
        );

        const data = await response.json();
        console.log("Response data:", data);

        const { paymentIntent, ephemeralKey, customer } = data;

        if (!paymentIntent) {
          throw new Error("PaymentIntent is missing in the response.");
        }

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          ephemeralKeySecret: ephemeralKey,
          customerId: customer,
          returnURL: "your-app://return-url", // Ensure this URL is correct
          merchantDisplayName: "Your Merchant Name",
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
          const { uid, email } = user;

          const userDoc = await getDoc(
            doc(FIREBASE_DB, "StudentsProfiles", uid)
          );
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
            deliveryDetails:
              selectedOption === "delivery" ? deliveryDetails : pickupAddress,
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
      <Text style={styles.sectionTitle}>Selected Menu Items</Text>
    </>
  );

  const renderFooter = () => (
    <>
      <Text style={styles.sectionTitle}>Selected Plan</Text>
      <View style={styles.planContainer}>
        <Text style={styles.planText}>{chosenPlan}</Text>
      </View>
      <Text style={styles.totalPrice}>
        Total Price: ${totalPrice.toFixed(2)}
      </Text>
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
            style={[
              styles.optionButton,
              selectedOption === "pickup" && styles.selectedOptionButton,
            ]}
            onPress={() => setSelectedOption("pickup")}
          >
            <Text style={styles.optionText}>Pickup</Text>
          </TouchableOpacity>
        )}
        {delivery && (
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedOption === "delivery" && styles.selectedOptionButton,
            ]}
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
              style={[
                styles.placeOrderButton,
                {
                  opacity:
                    selectedOption === "delivery" && !deliveryDetails ? 0.5 : 1,
                },
              ]}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
    marginLeft: 16,
    color: "#FE660F",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    backgroundColor: "#FFF",
  },
  itemName: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  planContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  planText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  deliveryOptionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  deliveryOptionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  optionButton: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
    marginVertical: 4,
  },
  selectedOptionButton: {
    backgroundColor: "#FE660F",
  },
  optionText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  addressContainer: {
    marginTop: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  addressText: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  placeOrderButton: {
    backgroundColor: "#FE660F",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Checkout;
