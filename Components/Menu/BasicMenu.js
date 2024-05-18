import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons

const BasicMenu = ({ navigation }) => {

    const goToHome = () => {
        navigation.navigate('HomeMain');
    };

    const recipes = [
        { id: '1', name: 'Chicken Biryani' },
        { id: '2', name: 'Paneer Butter Masala' },
        { id: '3', name: 'Chole Bhature' },
        { id: '4', name: 'Masala Dosa' },
        { id: '5', name: 'Butter Chicken' },
    ];

    const renderRecipe = ({ item }) => (
        <View style={styles.recipeItem}>
            <Text style={styles.recipeText}>{item.name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goToHome} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="black" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.heading}>Chef 1</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.subheading}>Meals offered by Chef 1</Text>
                <FlatList 
                    data={recipes}
                    renderItem={renderRecipe}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.recipesList}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EDF3EB",
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
        marginLeft: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 18,
        marginLeft: 5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    subheading: {
        fontSize: 16,
        marginVertical: 20,
        textAlign: 'center',
    },
    recipesList: {
        alignItems: 'center',
    },
    recipeItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        width: '90%',
        alignItems: 'center',
    },
    recipeText: {
        fontSize: 16,
    },
});

export default BasicMenu;
