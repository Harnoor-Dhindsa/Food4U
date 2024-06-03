// FavScreen.js

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const FavScreen = ({ favorites }) => {
  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favItem}>
      <Text style={styles.favName}>{item.firstName} {item.lastName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorite Chefs</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  favItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  favName: {
    fontSize: 18,
  },
});

export default FavScreen;
