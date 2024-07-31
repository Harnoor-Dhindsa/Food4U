import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity,} from 'react-native';

const Screen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../Images/screen3.jpg')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.heading}>All your favorite recipes in one place</Text>
      <Text style={styles.description}>
        Here you can find a variety of delicious recipes to try out and enjoy.
        From breakfast to dinner, we have you covered!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {navigation.navigate('SelectionScreen');}}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    height: 650,
    marginTop: "-30%",
    marginBottom: "9%",
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FE660F',
    paddingVertical: 15,
    paddingHorizontal: "30%",
    borderRadius: 50,
    marginBottom: 50,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Screen;
