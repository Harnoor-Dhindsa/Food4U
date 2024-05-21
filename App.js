import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Screen from "./Components/Screen";
import ChooseStudentOrChef from "./Components/ChooseStudentOrChef";
import LoginScreen from "./Components/UserSide/LoginScreen";
import SignupScreen from "./Components/UserSide/SignupScreen";
import ChefLoginScreen from "./Components/ChefSide/ChefLoginScreen";
import ChefCreateAccount from "./Components/ChefSide/ChefCreateAccount";
import StudentHomePage from "./Components/UserSide/StudentHomePage";
import ChefHomeScreen from "./Components/ChefSide/ChefHomeScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Screen">
        <Stack.Screen name="Screen" component={Screen} options={{ headerShown: false }}/>
        <Stack.Screen name="ChooseStudentOrChef" component={ChooseStudentOrChef} options={{ headerShown: false }}/>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ChefLoginScreen" component={ChefLoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ChefCreateAccount" component={ChefCreateAccount} options={{ headerShown: false }}/>
        <Stack.Screen name="StudentHomePage" component={StudentHomePage} options={{ headerShown: false }}/>
        <Stack.Screen name="ChefHomeScreen" component={ChefHomeScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
