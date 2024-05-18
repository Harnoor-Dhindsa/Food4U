import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons
import { FIREBASE_AUTH } from '../_utils/FirebaseConfig';

const ProfilePage = () => {

  const LogOut = () => { FIREBASE_AUTH.signOut() };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={LogOut}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#EDF3EB", // Adjust space between header/options/footer
  },
  header: {
    alignItems: 'center',
    paddingTop: "15%",
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: "#FE660F", // You can change this color as per your preference
    padding: 10,
    borderRadius: 20, // Curved corners
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff', // White text color
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfilePage;
