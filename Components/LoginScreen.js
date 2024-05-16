import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { FIREBASE_AUTH } from '../_utils/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignIn = async () => {
    try{
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error){
      console.log(error);
      alert("Check your email and password");
    }
  };

  const goToSignUp = () => {
    // Navigate to the signup page
    navigation.replace('Signup');
  };

  const goToFront = () => {
    // Navigate to the signup page
    navigation.navigate('Screen');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
      <TouchableOpacity onPress={goToFront} style={styles.backButton}>
          <Ionicons name="arrow-back" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.heading}>Welcome Back !</Text>
      <Text style={styles.subheading}>It's nice to have you back</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.labelp}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry = {true}
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <Text style={styles.forgot}>Forgot Password?</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton} onPress={goToSignUp}>
      <Text style={styles.textd}>
        Don't have an account yet?{' '}
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
  label: {
    marginTop: "10%",
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  labelp: {
    marginTop: 20,
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  forgot: {
    marginTop: 10,
    color: '#FE660F',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: "12%",
    backgroundColor: '#FE660F',
    width: '100%',
    height: 50,
    borderRadius: 50,
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
    textAlign: 'center',
    color: '#FE660F',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default LoginScreen;
