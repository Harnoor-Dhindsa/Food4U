import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from "react-native";
import { AppContext } from "../../../others/AppContext";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ navigation }) => {
  const { cart, removeFromCart } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const navigateToCheckout = (menu) => {
    console.log("Navigating to Checkout with menu:", menu);
    navigation.navigate("Checkout", { selectedMenu: menu });
  };

  const handleRemoveFromCart = () => {
    if (selectedMenu) {
      removeFromCart(selectedMenu); // Pass the selected menu to removeFromCart
      setModalVisible(false); // Close the modal after removal
      setSelectedMenu(null); // Reset the selected menu
    }
  };

  const handleLongPress = (menu) => {
    setSelectedMenu(menu); // Set the selected menu
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <TouchableOpacity
        style={styles.menuInfo}
        onPress={() => navigateToCheckout(item)}
        onLongPress={() => handleLongPress(item)}
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
        </View>
      </TouchableOpacity>
      <Text style={styles.menuPrice}>${item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headingmain}>Cart</Text>
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nothing in Cart</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Do you want to remove this menu from Cart?
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleRemoveFromCart} // Call handleRemoveFromCart
            >
              <Text style={styles.modalButtonText}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedMenu(null);
              }}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  headingmain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 20,
    marginTop: -6,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButton: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#FE660F',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FE660F',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#FE660F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
