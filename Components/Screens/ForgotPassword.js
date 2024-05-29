import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FIREBASE_AUTH } from "../../_utils/FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      alert("Password reset email sent!");
      navigation.goBack(); // Navigate back to the login screen
    } catch (error) {
      console.log(error);
      alert(
        "Failed to send password reset email. Please check your email address."
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={34} color="black" />
      </TouchableOpacity>
      <Text style={styles.heading}>Reset Password</Text>
      <Text style={styles.subheading}>
        Enter your email to receive a password reset link
      </Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
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
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
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
  button: {
    marginTop: "12%",
    backgroundColor: "#FE660F",
    width: "100%",
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
