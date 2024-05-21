import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons"; // 
import FavScreen from "./FavScreen";
import CartScreen from "./CartScreen";
import ProfilePage from "./ProfilePage";
import HomeScreen from "./HomeScreen";

const Tab = createBottomTabNavigator();

const StudentHomePage = () => {
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
        tabBarStyle: {
          height: "9%",
          backgroundColor: "white",
          borderTopWidth: 3,
          borderTopColor: "#FE660F",
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "bold",
          marginBottom: 8,
        },
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
        component={ProfilePage}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default StudentHomePage;
