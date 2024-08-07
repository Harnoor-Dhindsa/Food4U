import React, { useEffect, useState, useCallback, useContext } from "react";
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
  StatusBar,
} from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FIREBASE_DB } from "../../../../_utils/FirebaseConfig";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { AppContext } from "../../../others/AppContext";

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
      } else if (selectedFilter === "priceLowToHigh") {
        menusQuery = query(menusQuery, orderBy("monthlyPrice", "asc"));
      } else if (selectedFilter === "priceHighToLow") {
        menusQuery = query(menusQuery, orderBy("monthlyPrice", "desc"));
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
  

  const goToCart = () => {
    navigation.navigate("Cart");
  };

  const { cart } = useContext(AppContext);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.headingContainer}>
      <Text style={styles.headingMain}>Home</Text>
      <View style={styles.iconContainer}>
      <TouchableOpacity style={styles.cartIcon} onPress={goToCart}>
      <Ionicons name="cart-outline" size={28} color="#000" />
      {cart.length > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cart.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
</View>

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
        <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
        <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity
        onPress={() => selectFilter("priceLowToHigh")}
        style={[
          styles.modalOption,
          selectedFilter === "priceLowToHigh" && styles.selectedModalOption,
        ]}
      >
        <Text
          style={[
            styles.modalOptionText,
            selectedFilter === "priceLowToHigh" && styles.selectedModalOptionText,
          ]}
        >
          Price: Low to High
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => selectFilter("priceHighToLow")}
        style={[
          styles.modalOption,
          selectedFilter === "priceHighToLow" && styles.selectedModalOption,
        ]}
      >
        <Text
          style={[
            styles.modalOptionText,
            selectedFilter === "priceHighToLow" && styles.selectedModalOptionText,
          ]}
        >
          Price: High to Low
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
    paddingHorizontal: 10,
  },
  searchIcon: {
    backgroundColor: "#f7f7f7",
    color: "#000",
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  headingMain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  cartBadge: {
    position: "absolute",
    right: 0,
    top: 4,
    backgroundColor: "#FE660F",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: 'row',
  },
  cartIcon: {
    padding: 10,
  },
  searchBar: {
    flex: 0.85, // Adjusted to take up less space
    height: 50,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 50,
  },
  filterButton: {
    flex: 0.15, // Adjusted to take up more space
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10, // Add margin to separate from search bar
    marginRight: -10, // Add margin to separate from search bar
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  flatListContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
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
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FE660F'
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