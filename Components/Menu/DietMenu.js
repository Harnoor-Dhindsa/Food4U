import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons

const DietMenu = ({ navigation }) => {

    const goToHome = () => {
        navigation.navigate('HomeMain');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goToHome} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="black" />
                    <Text style={styles.backText}></Text>
                </TouchableOpacity>
                <Text style={styles.heading}>Diet Plan</Text>
            </View>
            <View>
                <Text style={styles.subheading}>This is the Diet plan</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EDF3EB", // Adjust space between header/options/footer
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: "15%",
        paddingHorizontal: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10, // Add margin to separate heading from back arrow
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 18,
        marginLeft: 5, // Add margin to separate back arrow from text
    },
    subheading: {
        fontSize: 16,
        marginTop: "50%",
        textAlign: 'center',
    },
});

export default DietMenu;
