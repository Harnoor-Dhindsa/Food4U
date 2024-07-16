import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SectionList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import axios from "axios";
import { AppContext } from "../../others/AppContext";

const MenuDetail = ({ route, navigation }) => {
  const { menu } = route.params;
  const { favorites, addToFavorites, removeFromFavorites, addToCart, cart } =
    useContext(AppContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [ephemeralKey, setEphemeralKey] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isFav = favorites.some((item) => item.id === menu.id);
    setIsFavorite(isFav);
    fetchPaymentIntent();
  }, [favorites, menu.id]);

  const fetchPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.76:3000/create-payment-intent",
        {
          amount: menu.monthlyPrice * 100, // Stripe requires amount in cents
          currency: "usd",
          chefStripeAccountId: menu.chefStripeAccountId,
        }
      );
      setClientSecret(response.data.clientSecret);
      setEphemeralKey(response.data.ephemeralKey);
      setCustomerId(response.data.customer);
    } catch (error) {
      console.error("Error fetching payment intent:", error);
      // Handle error, show message to user
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(menu);
    } else {
      addToFavorites(menu);
    }
    setIsFavorite(!isFavorite);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

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

  const sections = [
    { title: "Items", data: menu.items },
    {
      title: "Dessert",
      data: menu.dessert
        ? [
            {
              name: menu.dessert,
              quantity: menu.dessertQuantity,
              days: menu.dessertDays,
            },
          ]
        : [],
    },
    {
      title: "Plans",
      data: [
        {
          type: "daily",
          label: "Daily",
          price: menu.dailyPrice,
          description: "Best for short term.",
        },
        {
          type: "weekly",
          label: "Weekly",
          price: menu.weeklyPrice,
          description: "Great for a week.",
        },
        {
          type: "monthly",
          label: "Monthly",
          price: menu.monthlyPrice,
          description: "Ideal for longer durations.",
        },
      ],
    },
  ];

  const renderSectionHeader = ({ section: { title } }) => {
    return <Text style={styles.subheading}>{title}</Text>;
  };

  const renderItem = ({ item, section }) => {
    if (section.title === "Items") {
      return (
        <View style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
        </View>
      );
    } else if (section.title === "Dessert") {
      if (item.name) {
        return (
          <View style={styles.dessertContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.text}>Quantity: {item.quantity}</Text>
            <Text style={styles.text}>
              Available:{" "}
              {Array.isArray(item.days) ? item.days.join(", ") : item.days}
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.noDessertContainer}>
            <Text style={styles.noDessertText}>No dessert available.</Text>
          </View>
        );
      }
    } else if (section.title === "Plans") {
      return (
        <TouchableOpacity
          style={[
            styles.planButton,
            selectedPlan === item.type && styles.selectedPlanButton,
          ]}
          onPress={() => handlePlanSelect(item.type)}
        >
          <Text style={styles.planText}>
            {item.label}: ${item.price}
          </Text>
          <Text style={styles.planDescription}>{item.description}</Text>
        </TouchableOpacity>
      );
    }
    return <Text style={styles.text}>{item}</Text>;
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

  const handleAddToCart = () => {
    const isAlreadyInCart = cart.some(
      (item) => item.id === menu.id && item.selectedPlan === selectedPlan
    );
    if (isAlreadyInCart) {
      Alert.alert(
        "Info",
        "This menu is already in the cart with the selected plan."
      );
    } else {
      const price = getPlanPrice(selectedPlan).slice(1); // Remove the '$' sign
      const parsedPrice = parseFloat(price);
      addToCart({
        id: menu.id,
        title: menu.title,
        chef: menu.chef,
        price: parsedPrice,
        selectedPlan: selectedPlan,
        quantity: 1,
      });
      navigation.navigate("Cart");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color="red"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.heading}>{menu.title}</Text>
        {renderPhotos()}
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={!selectedPlan || loading}
        >
          <Text style={styles.addToCartButtonText}>
            {loading ? "Loading..." : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  backButton: {
    padding: 10,
  },
  favoriteButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 16,
    color: "#777",
  },
  dessertContainer: {
    marginBottom: 10,
  },
  noDessertContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  noDessertText: {
    fontSize: 16,
    color: "#777",
  },
  imageContainer: {
    height: Dimensions.get("window").height * 0.35,
    marginBottom: 10,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageContainer: {
    height: Dimensions.get("window").height * 0.35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    fontSize: 16,
    color: "#777",
  },
  planButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedPlanButton: {
    borderColor: "#007bff",
    backgroundColor: "#007bff",
  },
  planText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: "#777",
  },
  addToCartButton: {
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 5,
    marginTop: 20,
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MenuDetail;
