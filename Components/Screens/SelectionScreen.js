import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';

const SelectionScreen = ({navigation}) => {

    const goToRegister = () => {
        navigation.navigate('Signup');
    };

    return (
        <ImageBackground 
            source={require('../Images/screen2.jpg')} // Replace with your image URL
            style={styles.background}
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.subHeading}>Choose Who You Are</Text>
                    <TouchableOpacity style={styles.buttonChef} onPress={goToRegister}>
                        <Text style={styles.buttonTextchef}>CHEF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStu} onPress={goToRegister}>
                        <Text style={styles.buttonTextstu}>STUDENT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  box: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  subHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  buttonChef: {
    padding: 20,
    borderRadius: 50,
    borderColor: '#FE660F',
    borderWidth: 2,
    width: "70%",
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonStu: {
    backgroundColor: '#FE660F',
    padding: 20,
    borderRadius: 50,
    width: "70%",
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonTextchef: {
    color: '#FE660F',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonTextstu: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SelectionScreen;
