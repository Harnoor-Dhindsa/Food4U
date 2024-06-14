import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { menu, selectedPlan } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FE660F" />
        </TouchableOpacity>
        <Text style={styles.heading}>Order Confirmation</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subheading}>Your Selected Menu</Text>
        <Text style={styles.menuDetail}>Menu: {menu.heading}</Text>
        <Text style={styles.menuDetail}>Plan: {selectedPlan}</Text>
      </View>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => navigation.navigate('PaymentScreen', { menu, selectedPlan })}
      >
        <Text style={styles.confirmButtonText}>Confirm Order</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backToMenuButton}
        onPress={() => navigation.navigate('MenuDetail', { menu })}
      >
        <Text style={styles.backToMenuButtonText}>Back to Menu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#EDF3EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center', 
    marginRight: 100,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#FE660F',
  },
  menuDetail: {
    fontSize: 16,
    marginVertical: 5,
  },
  confirmButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    position: 'absolute', // Position the button at the bottom
    bottom: 80,
    alignSelf: 'center', // Center the button horizontally
    width: '90%',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backToMenuButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    position: 'absolute', // Position the button at the bottom
    bottom: 20,
    alignSelf: 'center', // Center the button horizontally
    width: '90%',
  },
  backToMenuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default OrderConfirmationScreen;
