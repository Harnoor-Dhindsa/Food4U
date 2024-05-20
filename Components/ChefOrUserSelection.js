import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ChefOrUserSelection = ({ navigation }) => {
  const handleChefLogin = () => {
    navigation.navigate('Cheflogin');
  };

  const handleUserLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign in as</Text>
      <TouchableOpacity style={styles.button} onPress={handleChefLogin}>
        <Text style={styles.buttonText}>Chef</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF3EB',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FE660F',
    width: '80%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChefOrUserSelection;
