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
import { AppContext } from "../../others/AppContext";

const MenuDetail = ({ route, navigation }) => {
  const { menu } = route.params;
  const { favorites, addToFavorites, removeFromFavorites, addToCart, cart } =
    useContext(AppContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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
      addToCart(menu, selectedPlan);
      Alert.alert("Success", "Item has been added to cart",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
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
  contentContainer: {
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#FE660F",
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
    color: "#666",
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
    borderColor: "#FE660F",
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
    color: "#666",
    marginTop: 5,
  },
  addToCartButton: {
    backgroundColor: "#FE660F",
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
});

export default MenuDetail;
