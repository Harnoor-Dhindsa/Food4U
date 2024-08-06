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
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

          try {
            const profilePicRef = ref(
              FIREBASE_STORAGE,
              `profilePics/${menu.chefId}`
            );
            const profilePicUrl = await getDownloadURL(profilePicRef);
            setChefProfilePic(profilePicUrl);
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              console.log(
                "Chef profile picture not found, setting default image"
              );
              setChefProfilePic("../../Images/dp.jpg"); // Set the URL to your default image here
            } else {
              console.error("Error fetching profile picture:", error);
            }
          }
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
    ...(menu.dessert && menu.dessert.length
      ? [
          {
            title: "Dessert",
            data: [
              {
                name: menu.dessert,
                quantity: menu.dessertQuantity,
                days: menu.dessertDays,
              },
            ],
          },
        ]
      : []),
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
    if (section.title === "Items" || section.title === "Dessert") {
      return (
        <View style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          {section.title === "Dessert" && (
            <Text style={styles.itemQuantity}>
              Available:{" "}
              {Array.isArray(item.days) ? item.days.join(", ") : item.days}
            </Text>
          )}
        </View>
      );
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
        <FlatList
          horizontal
          pagingEnabled
          data={menu.avatars}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              {item ? (
                <Image source={{ uri: item }} style={styles.image} />
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageText}>Image not available</Text>
                </View>
              )}
            </View>
          )}
        />
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
        {
          text: "Go to Cart",
          onPress: () => navigation.navigate("Cart"), // Ensure 'CartScreen' is the correct name of your cart screen
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]);
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

  const getAvailabilityMessage = () => {
    const { pickup, delivery } = menu;
    if (pickup && delivery) {
      return "*Both pickup and delivery are available for this menu.";
    } else if (pickup) {
      return "*Only pickup is available for this menu.";
    } else if (delivery) {
      return "*Only delivery is available for this menu.";
    } else {
      return "*Neither pickup nor delivery is available for this menu.";
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
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.chefNameContainer}>
              {chefProfilePic ? (
                <Image
                  source={{ uri: chefProfilePic }}
                  style={styles.chefImage}
                />
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageText}></Text>
                </View>
              )}
              <Text style={styles.chefNameText}>{chefName}</Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={navigateToChat}
              >
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
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityMessage}>
                {getAvailabilityMessage()}
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <SectionList
                sections={sections}
                keyExtractor={(item, index) => item + index}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.sectionList}
              />
            </View>
          </>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !selectedPlan && styles.addToCartButtonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={!selectedPlan}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF3EB",
  },
  scrollContainer: {
    paddingBottom: 16,
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
    color: "#FE660F",
  },
  favoriteButton: {
    padding: 8,
  },
  chefNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#EDF3EB",
    borderRadius: 8,
    marginBottom: 16,
  },
  chefImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  chefNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FE660F",
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FE660F",
    padding: 8,
    borderRadius: 25,
    marginLeft: "auto",
  },
  chatButtonText: {
    color: "#FFF",
    marginLeft: 4,
  },
  chatIcon: {
    marginRight: 4,
  },
  imageContainer: {
    height: 200,
    marginVertical: 16,
  },
  slide: {
    width: Dimensions.get("window").width,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: Dimensions.get("window").width - 32,
    height: 180,
    borderRadius: 10,
    resizeMode: "cover",
    marginHorizontal: 16,
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 180,
    backgroundColor: "#C0C0C0",
    borderRadius: 10,
    marginHorizontal: 16,
  },
  noImageText: {
    color: "#FFF",
  },
  availabilityContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  availabilityMessage: {
    fontSize: 14,
    color: "#555",
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FE660F",
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  itemName: {
    fontSize: 16,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#777",
  },
  planButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FFF",
    borderColor: "#FE660F",
    borderWidth: 1,
    marginVertical: 4,
  },
  selectedPlanButton: {
    backgroundColor: "#FE660F",
  },
  planText: {
    fontSize: 16,
    color: "#333",
  },
  planDescription: {
    fontSize: 14,
    color: "#777",
  },
  addToCartButton: {
    backgroundColor: "#FE660F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#DDD",
  },
  addToCartButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MenuDetail;