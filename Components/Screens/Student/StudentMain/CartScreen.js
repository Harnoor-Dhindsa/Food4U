import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { AppContext } from "../../../others/AppContext";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#FE660F",
  background: "#EDF3EB",
  lightGrey: "#F0F0F0",
  darkGrey: "#666",
};

const CartScreen = ({ navigation }) => {
  const { cart, removeFromCart } = useContext(AppContext);

  const handleRemoveFromCart = (menu) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from the cart?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFromCart(menu) },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <TouchableOpacity
        style={styles.menuInfo}
        onPress={() => navigation.navigate("EditCartItem", { menu: item })}
      >
        {item.avatars && item.avatars.length > 0 ? (
          <Image
            source={{ uri: item.avatars[0] }}
            style={styles.image}
            onError={(e) =>
              console.log("Image load error:", e.nativeEvent.error)
            }
          />
        ) : null}
        <View style={styles.infoContainer}>
          <Text style={styles.menuTitle}>{item.heading}</Text>
          <Text style={styles.menuDescription}>{item.days.join(", ")}</Text>
          <Text style={styles.itemPlan}>
            Selected Plan: {item.selectedPlan}
          </Text>
        </View>
        <Text style={styles.menuPrice}>${item.price}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveFromCart(item)}
        accessibilityLabel={`Remove ${item.heading} from cart`}
      >
        <Ionicons name="trash-outline" size={24} color="#FE660F" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Text style={styles.emptyCartText}>Your cart is empty.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart && cart.length > 0 ? (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        />
      ) : (
        renderEmptyCart()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: COLORS.background,
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
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: COLORS.darkGrey,
  },
});

export default CartScreen;
