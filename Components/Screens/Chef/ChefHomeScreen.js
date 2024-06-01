// StudentHomeScreen.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons
import HomeScreen from './ChefMain/HomeScreen';
import FavScreen from './ChefMain/FavScreen';
import CartScreen from './ChefMain/CartScreen';
import ProfileScreen from './ChefMain/ProfileScreen';

const Tab = createBottomTabNavigator();

const ChefHomeScreen = () => {
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
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false}}/>
            <Tab.Screen name="Favorites" component={FavScreen} options={{ headerShown: false}}/>
            <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false}}/>
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false}}/>
        </Tab.Navigator>
    );
};

export default ChefHomeScreen;
