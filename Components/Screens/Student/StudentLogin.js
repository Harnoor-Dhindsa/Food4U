import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native'; // Import CommonActions
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const StudentLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleSignIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      await updateExpoPushToken();

      // Reset the navigation stack and navigate to StudentHomeScreen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'StudentHomeScreen' }],
        })
      );
    } catch (error) {
      console.log(error);
      alert("Check your email and password");
    }
  };

  const goToSignUp = () => {
    // Navigate to the signup page
    navigation.replace('StudentSignup');
  };

  const goToFront = () => {
    // Navigate to the front page
    navigation.navigate('SelectionScreen');
  };

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        icon: './assets/icon.png',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '49c55b76-29ca-4da9-9fb8-d598ab6051f3', // Replace with your actual project ID
      })).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  async function updateExpoPushToken(){
    try{
      const token = await registerForPushNotificationsAsync();
      const userUID = auth?.currentUser?.uid;
      if(token && userUID){
        await updateDoc(doc(FIREBASE_DB, "StudentsProfiles", userUID),{
          expoPushToken: token,
        });
      }
    } catch(error){
      console.log("Failed to Update Expo Push Token: ", error);
    }
  }
  

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TouchableOpacity onPress={goToFront} style={styles.backButton}>
          <Ionicons name="arrow-back" size={34} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.subheading}>It's nice to have you back buddy</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.forgot} onPress={() => navigation.navigate("ForgotPassword")}>
          Forgot Password?
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={goToSignUp}>
          <Text style={styles.textd}>
            Don't have an account yet?{" "}
            <Text style={styles.signup}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: "40%",
    backgroundColor: "#EDF3EB",
  },
  backButton: {
    marginTop: -50,
    marginBottom: "12%",
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  forgot: {
    color: '#FE660F',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 0,
    textAlign: 'left',
  },
  button: {
    marginTop: "12%",
    backgroundColor: '#FE660F',
    width: '100%',
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textd: {
    textAlign: 'center',
    marginTop: 20,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  signup: {
    color: '#FE660F',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default StudentLogin;