import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons
import { FIREBASE_AUTH } from '../../_utils/FirebaseConfig';

const ProfilePage = () => {

    const LogOut = () => {FIREBASE_AUTH.signOut()};
    
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
      </View>
      <Button style={styles.logout} title="Logout" onPress={LogOut} />
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
  logout: {
    margin: 10,
  },
});

export default ProfilePage;
