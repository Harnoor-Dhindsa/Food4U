import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, Alert, BackHandler } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import HomeScreen from "./ChefMain/HomeScreen";
import OrderScreen from "./ChefMain/OrderScreen";
import ChefChatListScreen from "./ChefMain/ChefChatListScreen";
import ProfileScreen from "./ChefMain/ProfileScreen";
import { useFocusEffect } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const ChefHomeScreen = () => {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Are you sure you want to exit the app?", [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Orders") {
            iconName = "bookmark-outline";
          } else if (route.name === "Chat") {
            iconName = "chatbox-outline";
          } else if (route.name === "Profile") {
            iconName = "person-outline";
          }

          return <Ionicons name={iconName} size={30} color={color} />;
        },
        tabBarActiveTintColor: "#FE660F",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          paddingVertical: Platform.OS === "ios" ? 10 : 5,
          height: 85,
          borderTopWidth: 3,
          borderTopColor: "#FE660F",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrderScreen} />
      <Tab.Screen name="Chat" component={ChefChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 2,
    borderTopColor: "#FE660F",
    height: Platform.OS === "ios" ? 65 : 60,
    paddingBottom: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ChefHomeScreen;
