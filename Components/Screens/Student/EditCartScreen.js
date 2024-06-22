import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { AppContext } from "../../others/AppContext";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#FE660F",
  background: "#EDF3EB",
  lightGrey: "#F0F0F0",
  darkGrey: "#666",
};

const EditCartScreen = ({ route, navigation }) => {
  const { menu } = route.params;
  const { removeFromCart, updateCartItem } = useContext(AppContext);
  const [quantity, setQuantity] = useState(menu.quantity);
  const [selectedPlan, setSelectedPlan] = useState(menu.selectedPlan);

  const handleRemoveFromCart = () => {
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

  const handleUpdateCartItem = () => {
    const updatedItem = {
      ...menu,
      quantity: quantity,
      selectedPlan: selectedPlan,
    };
    updateCartItem(updatedItem);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>{menu.heading}</Text>
        <Text style={styles.menuPrice}>${menu.price}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
          >
            <Ionicons name="remove-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Plan</Text>
        <TouchableOpacity
          style={styles.planButton}
          onPress={() => setSelectedPlan("daily")}
          activeOpacity={0.8}
        >
          <Text style={styles.planText}>Daily</Text>
          <Text style={styles.planDescription}>Best for short term.</Text>
          {selectedPlan === "daily" && (
            <Ionicons
              name="checkmark-outline"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.planButton}
          onPress={() => setSelectedPlan("weekly")}
          activeOpacity={0.8}
        >
          <Text style={styles.planText}>Weekly</Text>
          <Text style={styles.planDescription}>Great for a week.</Text>
          {selectedPlan === "weekly" && (
            <Ionicons
              name="checkmark-outline"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.planButton}
          onPress={() => setSelectedPlan("monthly")}
          activeOpacity={0.8}
        >
          <Text style={styles.planText}>Monthly</Text>
          <Text style={styles.planDescription}>
            Ideal for longer durations.
          </Text>
          {selectedPlan === "monthly" && (
            <Ionicons
              name="checkmark-outline"
              size={24}
              color={COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveFromCart}
          accessibilityLabel={`Remove ${menu.heading} from cart`}
        >
          <Ionicons name="trash-outline" size={24} color="#FE660F" />
          <Text style={styles.removeButtonText}>Remove from Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateCartItem}
          accessibilityLabel={`Update ${menu.heading} in cart`}
        >
          <Text style={styles.updateButtonText}>Update Cart Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuPrice: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 10,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  planButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGrey,
  },
  planText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.darkGrey,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  removeButtonText: {
    marginLeft: 10,
    color: "#FE660F",
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditCartScreen;
