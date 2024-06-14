import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Alert, BackHandler  } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons
import HomeScreen from './ChefMain/HomeScreen';
import OrderScreen from './ChefMain/OrderScreen';
import ChatScreen from './ChefMain/ChatScreen';
import ProfileScreen from './ChefMain/ProfileScreen';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const ChefHomeScreen = () => {
    useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            Alert.alert(
              "Exit App",
              "Are you sure you want to exit the app?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => BackHandler.exitApp() }
              ]
            );
            return true; // Prevent default behavior (back navigation)
          };
    
          BackHandler.addEventListener("hardwareBackPress", onBackPress);
    
          return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        }, [])
      );
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Orders') {
                        iconName = 'bookmark';
                    } else if (route.name === 'Chat') {
                        iconName = 'chatbox';
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
            <Tab.Screen name="Orders" component={OrderScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
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

export default ChefHomeScreen;