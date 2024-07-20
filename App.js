import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Screen from "./Components/Screens/Screen";
import SelectionScreen from "./Components/Screens/SelectionScreen";
import StudentLogin from "./Components/Screens/Student/StudentLogin";
import StudentSignup from "./Components/Screens/Student/StudentSignup";
import ChefLogin from "./Components/Screens/Chef/ChefLogin";
import ChefSignup from "./Components/Screens/Chef/ChefSignup";
import StudentHomeScreen from "./Components/Screens/Student/StudentHomeScreen";
import ChefHomeScreen from "./Components/Screens/Chef/ChefHomeScreen";
import CreateMenu from "./Components/Screens/Chef/CreateMenu";
import ViewMenu from "./Components/Screens/Chef/ViewMenu";
import EditMenu from "./Components/Screens/Chef/EditMenu";
import MenuList from "./Components/Screens/Student/MenuList";
import MenuDetail from "./Components/Screens/Student/MenuDetail";
import { AppProvider } from "./Components/others/AppContext";
import ForgotPassword from "./Components/Screens/ForgotPassword";
import ChefChatListScreen from "./Components/Screens/Chef/ChefMain/ChefChatListScreen";
import ChefChatScreen from "./Components/Screens/Chef/ChefChatScreen";
import StudentChatScreen from "./Components/Screens/Student/StudentChatScreen";
import StudentChatListScreen from "./Components/Screens/Student/StudentMain/StudentChatListScreen";
import CheckoutScreen from "./Components/Screens/Student/CheckoutScreen";
import CartScreen from "./Components/Screens/Student/StudentMain/CartScreen";
import { StripeProvider } from "@stripe/stripe-react-native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <StripeProvider
        publishableKey="pk_test_51POuNq2KqukMgC6pFkXCoiuutre7lxD0SiP00uRdvNFecGzQMuAX9bJsFlC3Jklgr94eOkWnp2m6GH27l3ijdSoL00DIkImryA"
        urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
        merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // required for Apple Pay
      >
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Screen">
            <Stack.Screen
              name="Screen"
              component={Screen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SelectionScreen"
              component={SelectionScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentLogin"
              component={StudentLogin}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentSignup"
              component={StudentSignup}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChefLogin"
              component={ChefLogin}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChefSignup"
              component={ChefSignup}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentHomeScreen"
              component={StudentHomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChefHomeScreen"
              component={ChefHomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateMenu"
              component={CreateMenu}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ViewMenu"
              component={ViewMenu}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditMenu"
              component={EditMenu}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MenuList"
              component={MenuList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MenuDetail"
              component={MenuDetail}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChefChatListScreen"
              component={ChefChatListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentChatListScreen"
              component={StudentChatListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChefChatScreen"
              component={ChefChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentChatScreen"
              component={StudentChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </AppProvider>
  );
}
