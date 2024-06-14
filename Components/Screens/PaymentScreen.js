import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = ({ route, navigation }) => {
  const { menu, selectedPlan } = route.params;
  const { confirmPayment } = useStripe();

  const handlePayment = async () => {
    try {
      const response = await fetch('http://your-server-url/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [{ id: 'menu', amount: 1000 }] }), // Example data
      });
      const { clientSecret } = await response.json();
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment failed', error.message);
      } else if (paymentIntent) {
        Alert.alert('Payment succeeded', 'Your payment was successful!', [
          { text: 'OK', onPress: () => navigation.navigate('ReviewScreen', { menu, selectedPlan }) },
        ]);
      }
    } catch (error) {
      Alert.alert('Payment failed', error.message);
    }
  };

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
        <Text style={styles.heading}>Payment</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subheading}>Order Summary</Text>
        <Text style={styles.menuDetail}>Menu: {menu.heading}</Text>
        <Text style={styles.menuDetail}>Plan: {selectedPlan}</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Pay Now</Text>
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
    marginRight: 150,
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
  payButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    position: 'absolute', 
    bottom: 20,
    alignSelf: 'center',
    width: '90%',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default PaymentScreen;
