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
      <Text style={styles.headingmain}>Orders</Text>
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
    backgroundColor: '#FFF',
  },
  headingmain: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 20,
    marginTop: 70,
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
  itemContainer: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 0,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FE660F',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
