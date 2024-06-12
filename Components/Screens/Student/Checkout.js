import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import { AppContext } from "../../others/AppContext";
import { loadStripe } from "@stripe/stripe-js";

const CheckoutScreen = ({ route, navigation }) => {
  const { menu, selectedPlan } = route.params;
  const { favorites, addToFavorites, removeFromFavorites } =
    useContext(AppContext);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const isFav = favorites.some((item) => item.id === menu.id);
    setIsFavorite(isFav);
  }, [favorites, menu.id]);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(menu);
    } else {
      addToFavorites(menu);
    }
    setIsFavorite(!isFavorite);
  };

  const renderPhotos = () => {
    if (menu.avatars && menu.avatars.length > 0) {
      return (
        <View style={styles.imageContainer}>
          <Swiper style={styles.wrapper} showsButtons={true} loop={false}>
            {menu.avatars.map((uri, index) => (
              <View key={index} style={styles.slide}>
                <Image source={{ uri: uri }} style={styles.image} />
              </View>
            ))}
          </Swiper>
        </View>
      );
    } else {
      return (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No images available.</Text>
        </View>
      );
    }
  };

  const getPlanPrice = () => {
    switch (selectedPlan) {
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

const handleCheckout = async () => {
  // Make an HTTP request to your backend endpoint
  try {
    const response = await axios.post("http://192.168.1.76:3000/checkout", {
      menu: menu,
      selectedPlan: selectedPlan,
      amount: menu.price, // Include menu price in the request payload
    });

    // Check if the request was successful
    if (response.status === 200) {
      // If successful, initiate the Stripe payment
      const stripe = await loadStripe(
        "pk_test_51POuNq2KqukMgC6pFkXCoiuutre7lxD0SiP00uRdvNFecGzQMuAX9bJsFlC3Jklgr94eOkWnp2m6GH27l3ijdSoL00DIkImryA"
      );
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: menu.stripePriceId, quantity: 1 }],
        mode: "payment",
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      if (error) {
        console.error("Error redirecting to checkout:", error);
      }
    } else {
      console.error("Error: Failed to send data to backend.");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FE660F" />
          </TouchableOpacity>
          <Text style={styles.heading}>{menu.heading}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color="#FE660F"
            />
          </TouchableOpacity>
        </View>
        {renderPhotos()}
        <View style={styles.planContainer}>
          <Text style={styles.planText}>Selected Plan: {selectedPlan}</Text>
          <Text style={styles.planPrice}>Total Cost: {getPlanPrice()}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutText}>Go to Checkout</Text>
      </TouchableOpacity>
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
  favoriteButton: {
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
  imageContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  noImageContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  noImageText: {
    fontSize: 18,
    color: "#666",
  },
  wrapper: {
    height: "100%",
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    width: width - 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  planContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFEDD5",
    marginHorizontal: 10,
    borderRadius: 10,
    borderColor: "#FE660F",
    borderWidth: 1,
  },
  planText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE660F",
  },
  checkoutButton: {
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default CheckoutScreen;
