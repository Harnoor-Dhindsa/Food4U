import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Alert, BackHandler  } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons
import HomeScreen from './ChefMain/HomeScreen';
import OrderScreen from './ChefMain/OrderScreen';
import ChefChatListScreen from './ChefMain/ChefChatListScreen';
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
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    let iconOutlineName;

                    if (route.name === 'Home') {
                        iconName = 'home';
                        iconOutlineName = 'home-outline';
                    } else if (route.name === 'Orders') {
                        iconName = 'receipt';
                        iconOutlineName = 'receipt-outline';
                    } else if (route.name === 'Chat') {
                        iconName = 'chatbox-ellipses';
                        iconOutlineName = 'chatbox-ellipses-outline';
                    } else if (route.name === 'Profile') {
                        iconName = 'person-circle';
                        iconOutlineName = 'person-circle-outline';
                    }

                    return <Ionicons name={focused ? iconName : iconOutlineName} color={color} size={size} />;
                },
                tabBarActiveTintColor: '#FE660F',
                tabBarInactiveTintColor: 'black',
                tabBarStyle: Platform.OS === 'ios' ? styles.tabBarIOS : styles.tabBar,
                tabBarLabelStyle: Platform.OS === 'ios' ? styles.tabBarLabelIOS : styles.tabBarLabel,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Orders" component={OrderScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Chat" component={ChefChatListScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: "9%",
        backgroundColor: 'white',
        paddingVertical: 5,
        shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2, // This is for Android
    },
    tabBarIOS: {
        height: '10%',
        backgroundColor: 'white',
        paddingBottom: 20,
        paddingTop: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 2, // This is for Android
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
