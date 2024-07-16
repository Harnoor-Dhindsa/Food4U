import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const CartScreen = ({ route }) => {
  const { cartItems } = route.params || { cartItems: [] }; // Default to empty array if undefined
  const navigation = useNavigation();

  const handleRemoveFromCart = (item) => {
    // Implement your logic to remove item from cart
    console.log("Removing item from cart:", item);
  };

  const navigateToCheckout = (item) => {
    navigation.navigate("Checkout", { menu: item });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuContainer}
      onPress={() => navigateToCheckout(item)}
    >
      <View style={styles.menuInfo}>
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
        </View>
        <Text style={styles.menuPrice}>${item.monthlyPrice}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveFromCart(item)}
      >
        <Ionicons name="trash-outline" size={24} color="#FE660F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

export default CartScreen;

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  menuInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoContainer: {
    marginLeft: 10,
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 5,
  },
  itemPlan: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 5,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  deleteButton: {
    padding: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
};
