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
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../_utils/FirebaseConfig";

const AdminHomeScreen = ({ navigation }) => {
  const [pendingMenus, setPendingMenus] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("menus");
  const [refreshing, setRefreshing] = useState(false);

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
          collection(FIREBASE_DB, "PendingVerification")
        );
        const verifications = verificationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingVerifications(verifications);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
      const { chefId: userUid, firstName, lastName, id } = verification;

      if (!firstName || !lastName) {
        throw new Error("First name or last name is undefined");
      }

      await addDoc(collection(FIREBASE_DB, "VerifiedChefs"), {
        chefId: userUid,
        firstName: firstName,
        lastName: lastName,
      });

      await deleteDoc(doc(FIREBASE_DB, "PendingVerification", id));
      Alert.alert("Success", "Verification approved successfully.");
      setPendingVerifications(pendingVerifications.filter((v) => v.id !== id));
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRejectVerification = async (userUid) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "PendingVerification", userUid));
      Alert.alert("Success", "Verification rejected successfully.");
      setPendingVerifications(
        pendingVerifications.filter((v) => v.userUid !== userUid)
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
      <Text style={styles.verificationText}>
        Chef Name: {item.firstName} {item.lastName}
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
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Pickup:</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="green"
                />
              </View>
            )}
            {selectedMenu.delivery && (
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Delivery:</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="green"
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Icon name="logout" size={24} color="red" onPress={handleLogOut} />
      </View>
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            activeSection === "menus" && styles.activeButton,
          ]}
          onPress={() => setActiveSection("menus")}
        >
          <Text
            style={[
              styles.sectionButtonText,
              activeSection === "menus" && styles.activeButtonText,
            ]}
          >
            Pending Menus
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            activeSection === "verifications" && styles.activeButton,
          ]}
          onPress={() => setActiveSection("verifications")}
        >
          <Text
            style={[
              styles.sectionButtonText,
              activeSection === "verifications" && styles.activeButtonText,
            ]}
          >
            Pending Verifications
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={activeSection === "menus" ? pendingMenus : pendingVerifications}
        keyExtractor={(item) => item.id}
        renderItem={
          activeSection === "menus" ? renderMenuItem : renderVerificationItem
        }
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <ListHeaderComponent />
            <ListFooterComponent />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  buttonSection: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  sectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "#d3d3d3",
  },
  activeButton: {
    backgroundColor: "#000",
  },
  sectionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  activeButtonText: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 50,
  },
  menuContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  verificationContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  verificationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    marginTop: 30,
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalCloseButton: {
    padding: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
  },
  footerContainer: {
    paddingBottom: 50,
  },
  section: {
    marginBottom: 15,
  },
  subheading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    color: "#000",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#000",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayItem: {
    backgroundColor: "#d3d3d3",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 16,
    color: "#000",
  },
  priceTable: {
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  priceValue: {
    fontSize: 16,
    color: "#000",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 5,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginRight: 5,
  },
});

export default AdminHomeScreen;
