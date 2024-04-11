import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './_utils/FirebaseConfig';
import HomeScreen from './Components/HomeScreen';
import ProfileScreen from './Components/ProfilePage';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons
import Screen from './Components/Screen';
import LoginScreen from './Components/LoginScreen';
import SignupScreen from './Components/SignupScreen';
import BasicMenu from './Components/Menu/BasicMenu';
import DietMenu from './Components/Menu/DietMenu';
import PremiumMenu from './Components/Menu/PremiumMenu';
import FavScreen from './Components/FavScreen';
import CartScreen from './Components/CartScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Basic" component={BasicMenu} options={{ headerShown: false }} />
      <Stack.Screen name="Diet" component={DietMenu} options={{ headerShown: false }} />
      <Stack.Screen name="Premium" component={PremiumMenu} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function FavStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Fav" component={FavScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator
          screenOptions={{
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
            },
          }}>
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={useIsFocused() ? "home" : "home-outline"} color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavStack}
            options={{
              tabBarLabel: 'Favorites',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={useIsFocused() ? "heart" : "heart-outline"} color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Cart"
            component={CartStack}
            options={{
              tabBarLabel: 'Cart',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={useIsFocused() ? "cart" : "cart-outline"} color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileStack}
            options={{
              tabBarLabel: 'Profile',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={useIsFocused() ? "person" : "person-outline"} color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      ) : (   
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Screen" component={Screen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>   
      )}
    </NavigationContainer>
  );
}
