import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons

const DietMenu = ({ navigation }) => {

    const goToHome = () => {
        navigation.navigate('HomeMain');
    };

    const mealPlans = [
        { id: '1', name: 'Chicken Biryani Combo', image: 'https://example.com/chicken-biryani.jpg' },
        { id: '2', name: 'Paneer Butter Masala Combo', image: 'https://example.com/paneer-butter-masala.jpg' },
        { id: '3', name: 'Chole Bhature Combo', image: 'https://example.com/chole-bhature.jpg' },
        { id: '4', name: 'Masala Dosa Combo', image: 'https://example.com/masala-dosa.jpg' },
        { id: '5', name: 'Butter Chicken Combo', image: 'https://example.com/butter-chicken.jpg' },
    ];

    const renderMealPlan = ({ item }) => (
        <View style={styles.mealPlanItem}>
            <Image source={{ uri: item.image }} style={styles.mealPlanImage} />
            <Text style={styles.mealPlanText}>{item.name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goToHome} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="black" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.heading}>Chef 2</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.subheading}>Meals offered by Chef 2</Text>
                <FlatList 
                    data={mealPlans}
                    renderItem={renderMealPlan}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.mealPlansList}
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
    mealPlansList: {
        alignItems: 'center',
    },
    mealPlanItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
        width: '90%',
    },
    mealPlanImage: {
        width: 200,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    mealPlanText: {
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
});

export default DietMenu;
