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
import {
  FIREBASE_DB,
  FIREBASE_STORAGE,
  FIREBASE_AUTH,
} from "../../../_utils/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

const MenuDetail = ({ route, navigation }) => {
  const { menu } = route.params;
  const { favorites, addToFavorites, removeFromFavorites, addToCart, cart } =
    useContext(AppContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [chefName, setChefName] = useState("");
  const [chefProfilePic, setChefProfilePic] = useState("");

  useEffect(() => {
    const isFav = favorites.some((item) => item.id === menu.id);
    setIsFavorite(isFav);
  }, [favorites, menu.id]);

  useEffect(() => {
    const fetchChefData = async () => {
      try {
        const chefDocRef = doc(FIREBASE_DB, "ChefsProfiles", menu.chefId);
        const chefDoc = await getDoc(chefDocRef);
        if (chefDoc.exists()) {
          const chefData = chefDoc.data();
          setChefName(`${chefData.firstName} ${chefData.lastName}`);

          const profilePicRef = ref(
            FIREBASE_STORAGE,
            `profilePics/${menu.chefId}`
          );
          const profilePicUrl = await getDownloadURL(profilePicRef);
          setChefProfilePic(profilePicUrl);
        } else {
          console.log("Chef profile not found");
        }
      } catch (error) {
        console.error("Error fetching chef's data:", error);
      }
    };

    fetchChefData();
  }, [menu.chefId]);

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
      Alert.alert("Success", "Item has been added to cart");
    }
  };

  const navigateToChat = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const studentDoc = await getDoc(
        doc(FIREBASE_DB, "StudentsProfiles", user.uid)
      );
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        const studentName = `${studentData.firstName} ${studentData.lastName}`;
        navigation.navigate("StudentChatScreen", {
          chefId: menu.chefId,
          chefName,
          studentId: user.uid,
          studentName,
          chefProfilePic,
        });
      } else {
        console.error("Student profile not found");
      }
    } else {
      console.error("User data not available");
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
      <View style={styles.chefNameContainer}>
        <Image source={{ uri: chefProfilePic }} style={styles.chefImage} />
        <Text style={styles.chefNameText}> {chefName}</Text>
        <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#FFF"
            style={styles.chatIcon}
          />
          <Text style={styles.chatButtonText}>Chat</Text>
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
        <Text style={styles.addToCartButtonText}>
          Add to Cart {getPlanPrice(selectedPlan)}
        </Text>
      </TouchableOpacity>
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
  favoriteButton: {
    padding: 8,
  },
  chefNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  chefImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  chefNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
    flex: 1,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FE660F",
    padding: 8,
    borderRadius: 16,
  },
  chatIcon: {
    marginRight: 4,
  },
  chatButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  imageContainer: {
    height: Dimensions.get("window").height * 0.3,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB",
  },
  image: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noImageText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  subheading: {
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
  dessertContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  noDessertContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noDessertText: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  planButton: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
  },
  selectedPlanButton: {
    borderColor: "#FE660F",
    backgroundColor: "#FFF3E6",
  },
  planText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  planDescription: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  contentContainer: {
    paddingBottom: 16,
  },
  addToCartButton: {
    backgroundColor: "#FE660F",
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 8,
    margin: 16,
  },
  disabledAddToCartButton: {
    backgroundColor: "#FFA860",
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  text: {
    fontSize: 16,
    color: "#4A4A4A",
  },
});

export default MenuDetail;
