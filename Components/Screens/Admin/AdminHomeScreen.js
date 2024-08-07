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
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons for logout icon
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../_utils/FirebaseConfig"; // Import FIREBASE_AUTH for logout

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
      const menuWithOriginalId = { ...menu, originalId: menu.id };
      delete menuWithOriginalId.id;

      await addDoc(collection(FIREBASE_DB, "Menus"), menuWithOriginalId);
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
      Alert.alert("Success", "Verification rejected successfully.");
      setPendingVerifications(
        pendingVerifications.filter((v) => v.id !== verificationId)
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            FIREBASE_AUTH.signOut()
              .then(() => {
                navigation.replace("Screen"); // Replace 'Screen' with the actual screen name you want to navigate to
              })
              .catch((error) => {
                Alert.alert("Error", "Error in logging out");
              });
          },
        },
      ],
      { cancelable: true }
    );
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
    <View>
      {selectedMenu ? (
        <Text style={styles.heading}>{selectedMenu.heading}</Text>
      ) : null}
    </View>
  );

  const ListFooterComponent = () => (
    <View style={styles.footerContainer}>
      {selectedMenu && selectedMenu.items && selectedMenu.items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheading}>Menu Items</Text>
          {selectedMenu.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            </View>
          ))}
        </View>
      )}

      {selectedMenu && selectedMenu.days && (
        <View style={styles.section}>
          <Text style={styles.subheading}>Available Days</Text>
          <View style={styles.daysContainer}>
            {selectedMenu.days.map((day, index) => (
              <Text key={index} style={styles.dayItem}>
                {day}
              </Text>
            ))}
          </View>
        </View>
      )}

      {selectedMenu &&
        (selectedMenu.dailyPrice ||
          selectedMenu.weeklyPrice ||
          selectedMenu.monthlyPrice) && (
          <View style={styles.section}>
            <Text style={styles.subheading}>Prices</Text>
            <View style={styles.priceTable}>
              {selectedMenu.dailyPrice && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Daily Price:</Text>
                  <Text style={styles.priceValue}>
                    ${selectedMenu.dailyPrice}
                  </Text>
                </View>
              )}
              {selectedMenu.weeklyPrice && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Weekly Price:</Text>
                  <Text style={styles.priceValue}>
                    ${selectedMenu.weeklyPrice}
                  </Text>
                </View>
              )}
              {selectedMenu.monthlyPrice && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Monthly Price:</Text>
                  <Text style={styles.priceValue}>
                    ${selectedMenu.monthlyPrice}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

      {selectedMenu &&
        selectedMenu.avatars &&
        selectedMenu.avatars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheading}>Photos</Text>
            <View style={styles.imageContainer}>
              {selectedMenu.avatars.map((avatar, index) => (
                <Image
                  key={index}
                  source={{ uri: avatar }}
                  style={styles.image}
                />
              ))}
            </View>
          </View>
        )}

      {selectedMenu && (selectedMenu.pickup || selectedMenu.delivery) && (
        <View style={styles.section}>
          <Text style={styles.subheading}>Pickup & Delivery</Text>
          <View style={styles.optionContainer}>
            {selectedMenu.pickup && (
              <View style={styles.optionButton}>
                <Text style={styles.optionText}>Pickup</Text>
                <Text style={styles.optionText}>
                  Address: {selectedMenu.pickupAddress}
                </Text>
              </View>
            )}
            {selectedMenu.delivery && (
              <View style={styles.optionButton}>
                <Text style={styles.optionText}>Delivery</Text>
              </View>
            )}
          </View>
        </View>
      )}
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
          <Text>Pending Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === "verifications" && styles.activeNavButton,
          ]}
          onPress={() => setActiveSection("verifications")}
        >
          <Text>Pending Verification</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <Ionicons name="exit-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeSection === "menus" ? pendingMenus : pendingVerifications}
        renderItem={
          activeSection === "menus" ? renderMenuItem : renderVerificationItem
        }
        keyExtractor={(item) => item.id}
        ListHeaderComponent={activeSection === "menus" && ListHeaderComponent}
      />

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView>
            <ListHeaderComponent />
            <ListFooterComponent />
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  menuContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  menuHeading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailsButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  closeButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footerContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  section: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 16,
    color: "#555",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayItem: {
    backgroundColor: "#f0f0f0",
    padding: 6,
    borderRadius: 5,
    margin: 2,
  },
  priceTable: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceValue: {
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    margin: 5,
    flex: 1,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  navButton: {
    margin: 10,
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  logoutButton: {
    margin: 10,
  },
});

export default AdminHomeScreen;
