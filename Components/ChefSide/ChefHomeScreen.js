import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons from react-native-vector-icons
import ChefMainPage from "./ChefMainPage";
import OrdersScreen from "./OrdersScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

const ChefHomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Orders") {
            iconName = "clipboard";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          // Return the Ionicons component with the appropriate icon name, color, and size
          return <Ionicons name={iconName} color={color} size={size} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: "#FE660F",
        inactiveTintColor: "grey",
        style: {
          height: "9%",
          backgroundColor: "white",
          borderTopWidth: 3,
          borderTopColor: "#FE660F",
          paddingVertical: 5,
        },
        labelStyle: {
          fontSize: 13,
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen name="Home" component={ChefMainPage} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default ChefHomeScreen;
