import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Alert, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './StudentMain/HomeScreen';
import FavScreen from './StudentMain/FavScreen';
import CartScreen from './StudentMain/CartScreen';
import ProfileScreen from './StudentMain/ProfileScreen';
import StudentChatListScreen from './StudentMain/StudentChatListScreen';
import { useFocusEffect } from '@react-navigation/native';

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
          } else if (route.name === 'Favorites') {
            iconName = 'heart';
          } else if (route.name === 'Cart') {
            iconName = 'cart';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Chat') {
            iconName = 'chatbox-ellipses';
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
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={StudentChatListScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
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
