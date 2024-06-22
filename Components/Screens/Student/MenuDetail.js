import axios from "axios";
import React, { useState, useContext, useEffect, useCallback } from "react";
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
import { AppContext } from "../../others/AppContext";

const COLORS = {
  primary: "#FE660F",
  background: "#EDF3EB",
  lightGrey: "#F0F0F0",
  darkGrey: "#666",
};

const MenuDetail = ({
  route: {
    params: { menu },
  },
  navigation,
}) => {
  const { favorites, addToFavorites, removeFromFavorites, addToCart, cart } =
    useContext(AppContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (menu) {
      setLoading(false);
      const isFav = favorites.some((item) => item.id === menu.id);
      setIsFavorite(isFav);
    }
  }, [favorites, menu]);

  const toggleFavorite = useCallback(() => {
    if (isFavorite) {
      removeFromFavorites(menu);
    } else {
      addToFavorites(menu);
    }
    setIsFavorite((prev) => !prev);
  }, [isFavorite, menu, addToFavorites, removeFromFavorites]);

  const handlePlanSelect = useCallback((plan) => {
    setSelectedPlan(plan);
  }, []);

  const getPlanPrice = (plan) => {
    const price = {
      daily: menu.dailyPrice,
      weekly: menu.weeklyPrice,
      monthly: menu.monthlyPrice,
    }[plan];

    return price !== undefined ? `$${price}` : "";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
      addToCart(menu, selectedPlan);
      Alert.alert("Success", "Item has been added to cart", [
        { text: "OK" },
        { text: "Go to Cart", onPress: () => navigation.navigate("Cart") },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityHint="Navigates to the previous screen"
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.heading}>{menu.heading}</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          accessibilityLabel="Favorite"
          accessibilityHint="Toggle favorite status"
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      {renderPhotos()}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item + index}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
      />
      <TouchableOpacity
        style={[
          styles.addToCartButton,
          !selectedPlan && styles.disabledAddToCartButton,
        ]}
        disabled={!selectedPlan}
        onPress={handleAddToCart}
      >
        <Text style={styles.addToCartText}>
          Add to Cart {selectedPlan && `(${getPlanPrice(selectedPlan)})`}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey,
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
    backgroundColor: COLORS.lightGrey,
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  noImageContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGrey,
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  noImageText: {
    fontSize: 18,
    color: COLORS.darkGrey,
  },
  wrapper: {
    height: "100%",
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGrey,
    width: width - 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: COLORS.primary,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    fontWeight: "bold",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dessertContainer: {
    marginVertical: 5,
    fontWeight: "bold",
  },
  noDessertContainer: {
    paddingVertical: 10,
  },
  noDessertText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.darkGrey,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  planButton: {
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPlanButton: {
    backgroundColor: "#FFEDD5",
  },
  planText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.darkGrey,
    marginTop: 5,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 20,
  },
  disabledAddToCartButton: {
    backgroundColor: "#DDD",
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MenuDetail;
