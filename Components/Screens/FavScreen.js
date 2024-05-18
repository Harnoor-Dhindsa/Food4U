import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';

const FavScreen = () => {
    
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Favorites</Text>
      </View>
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

export default FavScreen;
