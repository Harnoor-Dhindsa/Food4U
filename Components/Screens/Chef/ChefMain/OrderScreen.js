import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async (chefId) => {
      try {
        const ordersCollection = collection(FIREBASE_DB, 'orders');
        const q = query(ordersCollection, where('chefId', '==', chefId));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map((doc) => doc.data());
        setOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        fetchOrders(user.uid);
      } else {
        setLoading(false);
        // Handle the case when the user is not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.menuName}>{item.heading}</Text>
        <Text style={styles.planName}>Plan: {item.chosenPlan}</Text>
      </View>
      <View style={styles.bodyContainer}>
        <View style={styles.subHeadingContainer}>
          <Text style={styles.subHeading}>Purchased by:</Text>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.subHeadingContainer}>
          <Text style={styles.subHeading}>Delivery Option:</Text>
          <Text style={styles.deliveryOption}>{item.selectedOption}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE660F" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.noOrdersContainer}>
        <Text style={styles.noOrdersText}>No orders available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontSize: 18,
    color: '#4A4A4A',
    marginTop: 16,
  },
  flatListContainer: {
    paddingBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#FFE5D1',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FE660F',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  bodyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subHeadingContainer: {
    flex: 1,
  },
  separator: {
    width: 1,
    backgroundColor: '#000',
    marginHorizontal: 8,
  },
  subHeading: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  deliveryOption: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
});

export default OrderScreen;
