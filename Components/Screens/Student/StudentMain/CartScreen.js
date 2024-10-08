import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { AppContext } from "../../../others/AppContext";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ navigation }) => {
  const { cart, removeFromCart } = useContext(AppContext);

  const navigateToCheckout = (menu) => {
    console.log("Navigating to Checkout with menu:", menu); // Debug statement
    navigation.navigate("Checkout", { selectedMenu: menu });
  };

  const handleRemoveFromCart = (menu) => {
    removeFromCart(menu);
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <TouchableOpacity
        style={styles.menuInfo}
        onPress={() => navigateToCheckout(item)}
      >
        {item.avatars && item.avatars.length > 0 ? (
          <Image
            source={{ uri: item.avatars[0] }}
            style={styles.image}
            onError={(e) => console.log(e.nativeEvent.error)}
          />
        ) : null}
        <View style={styles.infoContainer}>
          <Text style={styles.menuTitle}>{item.heading}</Text>
          <Text style={styles.menuDescription}>{item.days.join(", ")}</Text>
          <Text style={styles.itemPlan}>
            Selected Plan: {item.selectedPlan}
          </Text>
          <Text style={styles.menuPrice}>${item.price}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleRemoveFromCart(item)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    backgroundColor: "#EDF3EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContainer: {
    paddingHorizontal: 20,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFEDD5",
    borderColor: "#FE660F",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuDescription: {
    fontSize: 14,
    color: "gray",
  },
  itemPlan: {
    fontSize: 16,
    color: "#666",
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE660F",
    marginLeft: 10,
  },
  deleteButton: {
    padding: 5,
  },
});

export default CartScreen;
