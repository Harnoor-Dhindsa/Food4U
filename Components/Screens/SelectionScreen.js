import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const SelectionScreen = ({navigation}) => {

    const goToRegister = () => {
        navigation.navigate('Signup');
    };

  return (
    <View style={styles.container}>
      <Text style={styles.mainHeading}>WELCOME TO FOOD4U</Text>
      <Text style={styles.subHeading}>Choose Who You Are</Text>
      <TouchableOpacity style={styles.buttonChef} onPress={goToRegister}>
        <Text style={styles.buttonText}>Chief</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonStu} onPress={goToRegister}>
        <Text style={styles.buttonText}>Student</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF3EB",
    alignItems: 'center',
    padding: 20,
  },
  mainHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 70,
  },
  subHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 60,
  },
  buttonChef: {
    backgroundColor: '#FE660F',
    padding: 20,
    borderRadius: 50,
    width: "70%",
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 50,
  },
  buttonStu: {
    backgroundColor: '#FE660F',
    padding: 20,
    borderRadius: 50,
    width: "70%",
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SelectionScreen;
