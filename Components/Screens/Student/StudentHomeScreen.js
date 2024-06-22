import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, Alert, BackHandler } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import HomeScreen from "./StudentMain/HomeScreen";
import FavScreen from "./StudentMain/FavScreen";
import CartScreen from "./StudentMain/CartScreen";
import ProfileScreen from "./StudentMain/ProfileScreen";
import { useFocusEffect } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const StudentHomeScreen = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit the app?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "OK", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true; // Prevent default behavior (back navigation)
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Favorites") {
            iconName = "heart";
          } else if (route.name === "Cart") {
            iconName = "cart";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: "#FE660F",
        tabBarInactiveTintColor: "grey",
        tabBarStyle:
          Platform.OS === "ios" ? styles.tabBarIOS : styles.tabBarAndroid,
        tabBarLabelStyle:
          Platform.OS === "ios" ? styles.tabBarLabelIOS : styles.tabBarLabel,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarAndroid: {
    height: 60,
    backgroundColor: "#EDF3EB",
    borderTopWidth: 2,
    borderTopColor: "#FE660F",
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarIOS: {
    height: 80,
    backgroundColor: "#EDF3EB",
    borderTopWidth: 2,
    borderTopColor: "#FE660F",
    paddingBottom: 30,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tabBarLabelIOS: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12, // Adjusted margin for iOS
  },
});

export default StudentHomeScreen;
