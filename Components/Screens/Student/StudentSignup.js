import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const StudentSignup = ({navigation}) => {
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleSignUp =  async () => {
    try{
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
      
      // Save user details to Firestore
      await setDoc(doc(FIREBASE_DB, 'StudentsProfiles', user.uid), {
        firstName: FirstName,
        lastName: LastName,
        email: email
      });

      console.log(response);
      navigation.replace('StudentHomeScreen');
      alert("Go to Profile page to use the app!");
    } catch (error){
      console.log(error);
      alert("Error in creating account: " + error.message);
    }
  };

  const handleLogin = () => {
    navigation.replace('StudentLogin');
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
        <Text style={styles.heading}>Sign Up as Student</Text>
        <Text style={styles.subheading}>Create Your Account Now</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={FirstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={LastName}
            onChangeText={setLastName}
          />
        </View>
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
          <Ionicons name="lock-closed" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="black" />
          </TouchableOpacity>
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
    flex: 1,
    height: 50,
  },
  button: {
    backgroundColor: '#FE660F',
    width: '100%',
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StudentSignup;
