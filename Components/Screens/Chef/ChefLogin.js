import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { FIREBASE_AUTH } from '../../../_utils/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const ChefLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleSignIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      navigation.replace('ChefHomeScreen');
    } catch (error) {
      console.log(error);
      alert("Check your email and password");
    }
  };

  const goToSignUp = () => {
    // Navigate to the signup page
    navigation.replace('ChefSignup');
  };

  const goToFront = () => {
    // Navigate to the front page
    navigation.navigate('SelectionScreen');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TouchableOpacity onPress={goToFront} style={styles.backButton}>
          <Ionicons name="arrow-back" size={34} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.subheading}>It's nice to have you back chef</Text>
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
    fontSize: 15,
    marginBottom: 5,
  },
  signup: {
    color: '#FE660F',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ChefLogin;