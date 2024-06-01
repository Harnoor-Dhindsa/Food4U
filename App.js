import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Screen from './Components/Screens/Screen';
import SelectionScreen from './Components/Screens/SelectionScreen';
import StudentLogin from './Components/Screens/Student/StudentLogin';
import StudentSignup from './Components/Screens/Student/StudentSignup';
import ChefLogin from './Components/Screens/Chef/ChefLogin';
import ChefSignup from './Components/Screens/Chef/ChefSignup';
import StudentHomeScreen from './Components/Screens/Student/StudentHomeScreen';
import ChefHomeScreen from './Components/Screens/Chef/ChefHomeScreen';
import CreateMenu from './Components/Screens/Chef/CreateMenu';
import ViewMenu from './Components/Screens/Chef/ViewMenu';
import EditMenu from './Components/Screens/Chef/EditMenu';
import MenuList from './Components/Screens/Student/MenuList';
import MenuDetail from './Components/Screens/Student/MenuDetail';
import ReviewMenu from './Components/Screens/Chef/ReviewMenu';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Screen">
        <Stack.Screen name="Screen" component={Screen} options={{ headerShown: false}}/>
        <Stack.Screen name="SelectionScreen" component={SelectionScreen} options={{ headerShown: false}} />
        <Stack.Screen name="StudentLogin" component={StudentLogin} options={{ headerShown: false}}/>
        <Stack.Screen name="StudentSignup" component={StudentSignup} options={{ headerShown: false}}/>
        <Stack.Screen name="ChefLogin" component={ChefLogin} options={{ headerShown: false}}/>
        <Stack.Screen name="ChefSignup" component={ChefSignup} options={{ headerShown: false}}/>
        <Stack.Screen name="StudentHomeScreen" component={StudentHomeScreen} options={{ headerShown: false}}/>
        <Stack.Screen name="ChefHomeScreen" component={ChefHomeScreen} options={{ headerShown: false}}/>
        <Stack.Screen name="CreateMenu" component={CreateMenu} options={{ headerShown: false}}/>
        <Stack.Screen name="ViewMenu" component={ViewMenu} options={{ headerShown: false}}/>
        <Stack.Screen name="EditMenu" component={EditMenu} options={{ headerShown: false}}/>
        <Stack.Screen name="MenuList" component={MenuList} options={{ headerShown: false}}/>
        <Stack.Screen name="MenuDetail" component={MenuDetail} options={{ headerShown: false}}/>
        <Stack.Screen name="ReviewMenu" component={ReviewMenu} options={{ headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
