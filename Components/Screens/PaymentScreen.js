import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = ({ route, navigation }) => {
  const { menu, selectedPlan } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const getPlanPrice = (plan) => {
    switch (plan) {
      case 'daily':
        return menu.dailyPrice * 100; // converting to cents
      case 'weekly':
        return menu.weeklyPrice * 100;
      case 'monthly':
        return menu.monthlyPrice * 100;
      default:
        return 0;
    }
  };

  const fetchPaymentSheetParams = async () => {
    const response = await axios.post('http://localhost:3000/create-payment-intent', {
      amount: getPlanPrice(selectedPlan),
      currency: 'usd',
    });
    return response.data;
  };

  const initializePaymentSheet = async () => {
    const { clientSecret } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
    });

    if (!error) {
      await openPaymentSheet();
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
      navigation.navigate('ReviewScreen', { menu, selectedPlan });
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
        <Text style={styles.heading}>Payment Screen</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>Menu: {menu.heading}</Text>
        <Text style={styles.text}>Selected Plan: {selectedPlan}</Text>
        <Text style={styles.text}>Price: ${getPlanPrice(selectedPlan) / 100}</Text>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={initializePaymentSheet}
          disabled={loading}
        >
          <Text style={styles.paymentButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  paymentButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default PaymentScreen;
