import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  Modal,
} from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FIREBASE_DB } from "../../../../_utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchMenus = async () => {
    try {
      let menusQuery = collection(FIREBASE_DB, "Menus");

      if (selectedFilter === "newest") {
        menusQuery = query(menusQuery, orderBy("createdAt", "desc"));
      } else if (selectedFilter === "oldest") {
        menusQuery = query(menusQuery, orderBy("createdAt", "asc"));
      }

      const menusSnapshot = await getDocs(menusQuery);
      const menusList = menusSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenus(menusList);
    } catch (error) {
      console.error("Error fetching menus: ", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedFilter]);

  useEffect(() => {
    filterData(searchQuery);
  }, [menus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus().then(() => setRefreshing(false));
  }, [selectedFilter]);

  const filterData = (query) => {
    const lowercasedQuery = query.toLowerCase();

    const filteredMenusList = menus.filter((menu) => {
      const menuHeading = menu.heading ? menu.heading.toLowerCase() : "";
      const itemsMatch = menu.items
        ? menu.items.some(
            (item) =>
              item.name && item.name.toLowerCase().includes(lowercasedQuery)
          )
        : false;
      return menuHeading.includes(lowercasedQuery) || itemsMatch;
    });

    setFilteredMenus(filteredMenusList);
  };

  useEffect(() => {
    filterData(searchQuery);
  }, [searchQuery, menus]);

  const navigateToMenuDetail = (menu) => {
    navigation.navigate("MenuDetail", { menu });
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuContainer}
      onPress={() => navigateToMenuDetail(item)}
    >
      {item.avatars && item.avatars.length > 0 ? (
        <Image
          source={{ uri: item.avatars[0] }}
          style={styles.image}
          onError={(e) => console.log(e.nativeEvent.error)}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.menuTitle}>{item.heading}</Text>
        <Text style={styles.menuDescription}>{item.days.join(", ")}</Text>
      </View>
      <Text style={styles.menuPrice}>${item.monthlyPrice}</Text>
    </TouchableOpacity>
  );

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const selectFilter = (filter) => {
    setSelectedFilter(selectedFilter === filter ? null : filter);
    toggleModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headingmain}>Home</Text>
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={24}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by menu heading or dish..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#000"
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
      <FlatList
        data={searchQuery ? filteredMenus : menus}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => selectFilter("newest")}
              style={[
                styles.modalOption,
                selectedFilter === "newest" && styles.selectedModalOption,
              ]}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedFilter === "newest" && styles.selectedModalOptionText,
                ]}
              >
                Newest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectFilter("oldest")}
              style={[
                styles.modalOption,
                selectedFilter === "oldest" && styles.selectedModalOption,
              ]}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedFilter === "oldest" && styles.selectedModalOptionText,
                ]}
              >
                Oldest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
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
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 50,
  },
  searchIcon: {
    paddingLeft: 10,
    color: "black",
  },
  headingmain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 20,
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
    paddingRight: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#FE660F",
    borderRadius: 25,
    marginHorizontal: 20,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  flatListContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuDescription: {
    fontSize: 14,
    color: "#888",
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE660F",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedModalOption: {
    backgroundColor: "#FE660F",
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: "center",
  },
  selectedModalOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalCancel: {
    paddingVertical: 15,
  },
  modalCancelText: {
    fontSize: 18,
    textAlign: "center",
    color: "#FE660F",
  },
});

export default HomeScreen;