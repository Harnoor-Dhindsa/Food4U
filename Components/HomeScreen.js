import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons
import { StatusBar } from 'react-native';

const HomeScreen = ({ navigation }) => {

  const goToBasic = () => {
    navigation.navigate("Basic");
  }

  const goToDiet = () => {
    navigation.navigate("Diet");
  }

  const goToPremium = () => {
    navigation.navigate("Premium");
  }

  return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.heading}>Home</Text>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={goToBasic}>
          <Text style={styles.optionText}>Chef 1</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="black" style={styles.arrowIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={goToDiet}>
          <Text style={styles.optionText}>Chef 2</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="black" style={styles.arrowIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={goToPremium}>
          <Text style={styles.optionText}>Chef 3</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="black" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
  optionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'left', // Center the options container vertically
    marginBottom: "100%",
    left: 20, // Add margin bottom to separate from the footer
  },
  optionButton: {
    borderWidth: 2, // Add border width
    borderColor: '#FE660F', // Change border color
    backgroundColor: '#FFA36E', // Change button color
    width: "90%",
    height: 60,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between', // Align items horizontally with space between them
    alignItems: 'center', // Center items vertically
    paddingHorizontal: 20, // Add horizontal padding for icon
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', // Change text color
  },
  arrowIcon: {
    marginLeft: 10, // Add left margin to separate text from icon
  },
});

export default HomeScreen;
