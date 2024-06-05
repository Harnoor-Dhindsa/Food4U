import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { AppContext } from '../../../others/AppContext';
import { Ionicons } from '@expo/vector-icons';

const FavScreen = ({ navigation }) => {
  const { favorites, removeFromFavorites } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('MenuDetail', { menu: item })}
            >
              <Text style={styles.itemName}>{item.heading}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFromFavorites(item)}>
              <Ionicons name="heart" size={24} color="#FE660F" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EDF3EB',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 18,
  },
});

export default FavScreen;
