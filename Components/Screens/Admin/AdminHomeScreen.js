import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../../_utils/FirebaseConfig";

const AdminHomeScreen = ({ navigation }) => {
  const [pendingMenus, setPendingMenus] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("menus");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeSection === "menus") {
          const menuSnapshot = await getDocs(
            collection(FIREBASE_DB, "PendingMenus")
          );
          const menus = menuSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPendingMenus(menus);
        } else if (activeSection === "verifications") {
          const verificationSnapshot = await getDocs(
            collection(FIREBASE_DB, "PendingVerifications")
          );
          const verifications = verificationSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPendingVerifications(verifications);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [activeSection]);

  const handleApproveMenu = async (menu) => {
    try {
      await addDoc(collection(FIREBASE_DB, "Menus"), menu);
      await deleteDoc(doc(FIREBASE_DB, "PendingMenus", menu.id));
      Alert.alert("Success", "Menu approved successfully.");
      setPendingMenus(pendingMenus.filter((m) => m.id !== menu.id));
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRejectMenu = async (menuId) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "PendingMenus", menuId));
      Alert.alert("Success", "Menu rejected successfully.");
      setPendingMenus(pendingMenus.filter((m) => m.id !== menuId));
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleViewDetails = (menu) => {
    setSelectedMenu(menu);
    setModalVisible(true);
  };

  const handleApproveVerification = async (verification) => {
    try {
      // Implement your approval logic here
      Alert.alert("Success", "Verification approved successfully.");
      setPendingVerifications(
        pendingVerifications.filter((v) => v.id !== verification.id)
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRejectVerification = async (verificationId) => {
    try {
      // Implement your rejection logic here
      Alert.alert("Success", "Verification rejected successfully.");
      setPendingVerifications(
        pendingVerifications.filter((v) => v.id !== verificationId)
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <Text style={styles.menuHeading}>{item.heading}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApproveMenu(item)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectMenu(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerificationItem = ({ item }) => (
    <View style={styles.verificationContainer}>
      <Text style={styles.verificationHeading}>
        Document: {item.documentName}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApproveVerification(item)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectVerification(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeaderComponent = () => (
    <Text style={styles.heading}>{selectedMenu.heading}</Text>
  );

  const ListFooterComponent = () => (
    <View>
      <Text style={styles.subheading}>Dessert</Text>
      {selectedMenu.dessert && (
        <View style={styles.listItem}>
          <Text style={styles.itemName}>{selectedMenu.dessert}</Text>
          <Text style={styles.itemQuantity}>
            {selectedMenu.dessertQuantity}
          </Text>
          <Text style={styles.itemQuantity}>{selectedMenu.dessertDays}</Text>
        </View>
      )}

      <Text style={styles.subheading}>Available Days</Text>
      <View style={styles.daysContainer}>
        {selectedMenu.days.map((day, index) => (
          <Text key={index} style={styles.dayItem}>
            {day}
          </Text>
        ))}
      </View>

      <Text style={styles.subheading}>Prices</Text>
      <View style={styles.priceTable}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Daily Price:</Text>
          <Text style={styles.priceValue}>${selectedMenu.dailyPrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Weekly Price:</Text>
          <Text style={styles.priceValue}>${selectedMenu.weeklyPrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Monthly Price:</Text>
          <Text style={styles.priceValue}>${selectedMenu.monthlyPrice}</Text>
        </View>
      </View>

      {selectedMenu.avatars && selectedMenu.avatars.length > 0 && (
        <View style={styles.imageContainer}>
          {selectedMenu.avatars.map((avatar, index) => (
            <Image key={index} source={{ uri: avatar }} style={styles.image} />
          ))}
        </View>
      )}

      <Text style={styles.subheading}>Pickup & Delivery</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedMenu.pickup
              ? styles.selectedOption
              : styles.unselectedOption,
          ]}
          disabled={!selectedMenu.pickup}
        >
          <Text style={styles.optionText}>Pickup</Text>
          {selectedMenu.pickup && (
            <Text style={styles.optionText}>
              Address: {selectedMenu.pickupAddress}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedMenu.delivery
              ? styles.selectedOption
              : styles.unselectedOption,
          ]}
          disabled={!selectedMenu.delivery}
        >
          <Text style={styles.optionText}>Delivery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate("EditMenu", { menu: selectedMenu })}
      >
        <Icon name="edit" size={24} color="#fff" />
        <Text style={styles.editButtonText}>Edit Menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === "menus" && styles.activeNavButton,
          ]}
          onPress={() => setActiveSection("menus")}
        >
          <Text style={styles.navButtonText}>Pending Menus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === "verifications" && styles.activeNavButton,
          ]}
          onPress={() => setActiveSection("verifications")}
        >
          <Text style={styles.navButtonText}>Pending Verifications</Text>
        </TouchableOpacity>
      </View>
      {activeSection === "menus" ? (
        pendingMenus.length > 0 ? (
          <FlatList
            data={pendingMenus}
            keyExtractor={(item) => item.id}
            renderItem={renderMenuItem}
          />
        ) : (
          <Text style={styles.emptyText}>No pending menus at the moment.</Text>
        )
      ) : pendingVerifications.length > 0 ? (
        <FlatList
          data={pendingVerifications}
          keyExtractor={(item) => item.id}
          renderItem={renderVerificationItem}
        />
      ) : (
        <Text style={styles.emptyText}>
          No pending verifications at the moment.
        </Text>
      )}
      {selectedMenu && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ListHeaderComponent />
              <ListFooterComponent />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: "#EDF3EB",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#C2C2C2",
  },
  activeNavButton: {
    backgroundColor: "#1E6F5C",
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  menuContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  verificationContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  verificationHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsButton: {
    backgroundColor: "#1E6F5C",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#1E6F5C",
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayItem: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
    margin: 4,
  },
  priceTable: {
    marginTop: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceValue: {
    fontSize: 16,
  },
  imageContainer: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#4CAF50",
  },
  unselectedOption: {
    backgroundColor: "#C2C2C2",
  },
  optionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#1E6F5C",
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AdminHomeScreen;
