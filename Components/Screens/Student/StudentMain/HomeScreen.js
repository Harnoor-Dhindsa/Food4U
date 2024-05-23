import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../../_utils/FirebaseConfig';

const HomeScreen = () => {
  const [chefs, setChefs] = useState([]);

  useEffect(() => {
    const fetchChefs = async () => {
      const chefsCollection = collection(FIREBASE_DB, 'ChefsProfiles');
      const chefsSnapshot = await getDocs(chefsCollection);
      const chefsList = chefsSnapshot.docs.map(doc => doc.data()).filter(chef => chef.firstName);
      setChefs(chefsList);
    };

    fetchChefs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.chefContainer}>
      <Image 
        source={{ uri: item.profilePic }} 
        style={styles.profilePic} 
        onError={(e) => console.error(`Failed to load image: ${item.profilePic}`, e.nativeEvent.error)}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={"#EDF3EB"} />
      <FlatList
        data={chefs}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  container: {
    padding: 20,
  },
  chefContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    borderColor: '#FE660F',
    borderWidth: 2,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
});

export default HomeScreen;
