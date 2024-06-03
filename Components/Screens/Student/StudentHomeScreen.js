// StudentHomeScreen.js

import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './StudentMain/HomeScreen';
import FavScreen from './StudentMain/FavScreen';
import CartScreen from './StudentMain/CartScreen';
import ProfileScreen from './StudentMain/ProfileScreen';

const Tab = createBottomTabNavigator();

const StudentHomeScreen = () => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (chef) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.some((item) => item.id === chef.id)) {
        return prevFavorites.filter((item) => item.id !== chef.id);
      } else {
        return [...prevFavorites, chef];
      }
    });
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Favorites') {
            iconName = 'heart';
          } else if (route.name === 'Cart') {
            iconName = 'cart';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#FE660F',
        tabBarInactiveTintColor: 'grey',
        tabBarStyle: {
          height: "9%",
          backgroundColor: 'white',
          borderTopWidth: 3,
          borderTopColor: '#FE660F',
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          marginBottom: 8,
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen favorites={favorites} toggleFavorite={toggleFavorite} />}
      </Tab.Screen>
      <Tab.Screen name="Favorites">
        {() => <FavScreen favorites={favorites} />}
      </Tab.Screen>
      <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default StudentHomeScreen;
