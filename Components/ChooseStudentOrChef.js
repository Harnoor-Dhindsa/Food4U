import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ChooseStudentOrChef = ({ navigation }) => {
  const goToStudentLogin = () => {
    navigation.navigate("LoginScreen");
  };

  const goToChefLogin = () => {
    navigation.navigate("ChefLoginScreen");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={goToStudentLogin}>
        <Text style={styles.buttonText}>Join as Food Lover</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={goToChefLogin}>
        <Text style={styles.buttonText}>Join as Chef</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF3EB",
  },
  button: {
    backgroundColor: "#FE660F",
    width: 250,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChooseStudentOrChef;
