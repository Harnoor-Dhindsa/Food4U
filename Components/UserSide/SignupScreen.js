import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { FIREBASE_AUTH } from '../../_utils/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const SignupScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignUp =  async () => {
    try{
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);
      navigation.navigate('HomeScreen');
    } catch (error){
      console.log(error);
      alert("Error in creating account" + error.message);
    }
  };
  const handleLogin = () => {
    navigation.replace('Login');
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
      <Text style={styles.heading}>Sign Up !</Text>
      <Text style={styles.subheading}>Create Your Account Now</Text>
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.labele}>Email</Text>
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
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogin}>
      <Text style={styles.textd}>
        Have an account?{' '}
        <Text style={styles.signup}>Login</Text>
      </Text>
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "40%",
    paddingHorizontal: 20,
    backgroundColor: "#EDF3EB",
  },
  backButton: {
    marginTop: -50,
    marginBottom: "10%",
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  label: {
    marginTop: "10%",
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  labele: {
    marginTop: "8%",
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  labelp: {
    marginTop: "8%",
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  textd: {
    textAlign: 'center',
    marginTop: 30,
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
  input: {
    width: '100%',
    height: 50,
    borderRadius: 2,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#FE660F',
    width: '100%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
