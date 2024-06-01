import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Button,
  RefreshControl,
} from "react-native";
import { collection, getDocs, where, query } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../../_utils/FirebaseConfig";

const HomeScreen = ({ navigation }) => {
  const [menus, setMenus] = useState([]);
  const user = FIREBASE_AUTH.currentUser;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const q = query(
          collection(FIREBASE_DB, "menus"),
          where("chefId", "==", user.uid)
        ); // Updated 'menus' to lowercase
        const querySnapshot = await getDocs(q);
        const menusData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      }
    };

    fetchMenus();
  }, [user.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const fetchMenus = async () => {
      try {
        const q = query(
          collection(FIREBASE_DB, "menus"),
          where("chefId", "==", user.uid)
        ); // Updated 'menus' to lowercase
        const querySnapshot = await getDocs(q);
        const menusData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchMenus();
  }, [user.uid]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuContainer}
      onPress={() => navigation.navigate("ViewMenu", { menu: item })}
    >
      <Text style={styles.heading}>{item.heading}</Text>
      <Text style={styles.price}>${item.monthlyPrice}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <FlatList
        data={menus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <StatusBar barStyle="dark-content" backgroundColor={"white"} />
            <Button
              title="Add Menu"
              onPress={() => navigation.navigate("CreateMenu")}
            />
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "gray",
  },
});

export default HomeScreen;
