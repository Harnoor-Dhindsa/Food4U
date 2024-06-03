import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../_utils/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ChefSignup = ({ navigation }) => {
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;

      // Save user details to Firestore
      await setDoc(doc(FIREBASE_DB, 'ChefsProfiles', user.uid), {
        firstName: FirstName,
        lastName: LastName,
        email: email,
      });

      console.log(response);
      navigation.replace('ChefHomeScreen');
      alert("Go to Profile page to use the app!");
    } catch (error) {
      console.log(error);
      alert("Error in creating account: " + error.message);
    }
  };

  const handleLogin = () => {
    navigation.replace('ChefLogin');
  };

  const goToFront = () => {
    // Navigate to the front page
    navigation.navigate('SelectionScreen');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity onPress={goToFront} style={styles.backButton}>
            <Ionicons name="arrow-back" size={34} color="black" />
          </TouchableOpacity>
          <Text style={styles.heading}>Sign Up as Chef</Text>
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
              keyboardType="email-address"
              autoCapitalize="none"
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
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="black" />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF3EB",
  },
  scrollContainer: {
    paddingTop: "30%",  // Adjusted to make the content a bit higher
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: -55,  // Adjusted to make the back button a bit higher
    marginBottom: "8%",  // Adjusted to reduce the space below the back button
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
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
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  textd: {
    textAlign: 'center',
    marginTop: 20,  // Adjusted to reduce the top margin
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

export default ChefSignup;
