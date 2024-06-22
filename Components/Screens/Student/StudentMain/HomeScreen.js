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
} from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FIREBASE_DB } from "../../../../_utils/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [chefs, setChefs] = useState([]);
  const [menus, setMenus] = useState([]);
  const [filteredChefs, setFilteredChefs] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null); // No filter selected initially

  const fetchChefs = async () => {
    const chefsCollection = collection(FIREBASE_DB, "ChefsProfiles");
    const chefsSnapshot = await getDocs(chefsCollection);
    const chefsList = chefsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((chef) => chef.firstName);
    setChefs(chefsList);
  };

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
    fetchChefs();
    fetchMenus();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchChefs(), fetchMenus()]).then(() => setRefreshing(false));
  }, [selectedFilter]);

  const filterData = (query) => {
    const lowercasedQuery = query.toLowerCase();

    const filteredChefsList = chefs.filter((chef) => {
      const chefName = `${chef.firstName || ""} ${
        chef.lastName || ""
      }`.toLowerCase();
      return chefName.includes(lowercasedQuery);
    });

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

    setFilteredChefs(filteredChefsList);
    setFilteredMenus(filteredMenusList);
  };

  useEffect(() => {
    filterData(searchQuery);
  }, [searchQuery, chefs, menus]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setShowFilters(false); // Hide filters after selection (optional)
  };

  const clearFilter = () => {
    setSelectedFilter(null);
    setShowFilters(false); // Hide filters after clearing (optional)
  };

  const navigateToMenuDetail = (menu) => {
    navigation.navigate("MenuDetail", { menu });
  };

  const navigateToMenuList = (chefId) => {
    navigation.navigate("MenuList", { chefId });
  };

  const renderChefItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chefContainer}
      onPress={() => navigateToMenuList(item.id)}
    >
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

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
      ) : null}
      <View style={styles.infoContainer}>
        <Text style={styles.menuTitle}>{item.heading}</Text>
        <Text style={styles.menuDescription}>{item.days.join(", ")}</Text>
      </View>
      <Text style={styles.menuPrice}>${item.monthlyPrice}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleFilters}>
          <Ionicons name="options" size={24} color="#FE660F" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by chef name, menu heading, or dish..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      {showFilters && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "newest" && styles.selectedFilterButton,
            ]}
            onPress={() => applyFilter("newest")}
          >
            <Text style={styles.filterButtonText}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "oldest" && styles.selectedFilterButton,
            ]}
            onPress={() => applyFilter("oldest")}
          >
            <Text style={styles.filterButtonText}>Oldest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearFilter}
          >
            <Text style={styles.clearFilterButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={
          searchQuery
            ? filteredMenus.length > 0
              ? filteredMenus
              : filteredChefs
            : selectedFilter
            ? menus
            : chefs
        }
        renderItem={
          searchQuery
            ? filteredMenus.length > 0
              ? renderMenuItem
              : renderChefItem
            : selectedFilter
            ? renderMenuItem
            : renderChefItem
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#EDF3EB",
    borderWidth: 2,
    borderColor: "#FE660F",
    borderRadius: 20,
  },
  selectedFilterButton: {
    backgroundColor: "#FE660F",
  },
  filterButtonText: {
    color: "#FE660F",
    fontWeight: "bold",
  },
  clearFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FE660F",
    borderRadius: 20,
  },
  clearFilterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  flatListContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  chefContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderColor: "#FE660F",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#fff8e1",
    borderColor: "#FE660F",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuDescription: {
    fontSize: 14,
    color: "#666",
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE660F",
    marginLeft: 10,
  },
});

export default HomeScreen;
