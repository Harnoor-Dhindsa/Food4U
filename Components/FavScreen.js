import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavScreen = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // Load favorite recipes from AsyncStorage when component mounts
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            if (storedFavorites !== null) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const addToFavorites = async (recipeName) => {
        try {
            // Check if recipe is already in favorites
            if (favorites.includes(recipeName)) {
                Alert.alert('Already added', 'This recipe is already in your favorites.');
                return;
            }

            // Add recipe to favorites
            const updatedFavorites = [...favorites, recipeName];
            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
            Alert.alert('Added to favorites', 'Recipe has been added to your favorites.');
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Favorites</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => addToFavorites('Your Recipe Name')}>
                <Text style={styles.addButtonText}>Add Recipe to Favorites</Text>
            </TouchableOpacity>
            <View style={styles.content}>
                <FlatList
                    data={favorites}
                    renderItem={({ item }) => (
                        <View style={styles.recipeItem}>
                            <Text style={styles.recipeText}>{item}</Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.recipeList}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#EDF3EB",
    },
    header: {
        alignItems: 'center',
        paddingTop: "15%",
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        width: '100%',
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
    addButton: {
        position: '',
        top: 70, // Adjust this value as needed
        backgroundColor: '#FE660F',
        padding: 10,
        borderRadius: 5,
    },
    addButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    recipeList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});

export default FavScreen;
