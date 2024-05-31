import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons
import HomeScreen from './StudentMain/HomeScreen';
import FavScreen from './StudentMain/FavScreen';
import CartScreen from './StudentMain/CartScreen';
import ProfileScreen from './StudentMain/ProfileScreen';

const Tab = createBottomTabNavigator();

const StudentHomeScreen = () => {
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
                tabBarStyle: Platform.OS === 'ios' ? styles.tabBarIOS : styles.tabBar,
                tabBarLabelStyle: Platform.OS === 'ios' ? styles.tabBarLabelIOS : styles.tabBarLabel,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Favorites" component={FavScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: "9%",
        backgroundColor: 'white',
        borderTopWidth: 3,
        borderTopColor: '#FE660F',
        paddingVertical: 5,
    },
    tabBarIOS: {
        height: '10%',
        backgroundColor: 'white',
        borderTopWidth: 3,
        borderTopColor: '#FE660F',
        paddingBottom: 20,
        paddingTop: 5,
    },
    tabBarLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tabBarLabelIOS: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 12,  // Adjusted margin for iOS
    },
});

export default StudentHomeScreen;
