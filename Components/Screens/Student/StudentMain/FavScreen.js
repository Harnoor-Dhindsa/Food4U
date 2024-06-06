import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { AppContext } from '../../../others/AppContext';
import { Ionicons } from '@expo/vector-icons';

const FavScreen = ({ navigation }) => {
  const { favorites, removeFromFavorites } = useContext(AppContext);

  const navigateToMenuDetail = (menu) => {
    navigation.navigate('MenuDetail', { menu });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.menuContainer} onPress={() => navigateToMenuDetail(item)}>
      {item.avatars && item.avatars.length > 0 ? (
        <Image source={{ uri: item.avatars[0] }} style={styles.image} onError={(e) => console.log(e.nativeEvent.error)} />
      ) : null}
      <View style={styles.infoContainer}>
        <Text style={styles.menuTitle}>{item.heading}</Text>
        <Text style={styles.menuDescription}>{item.days.join(', ')}</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromFavorites(item)}>
        <Ionicons name="heart" size={24} color="#FE660F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    backgroundColor: '#EDF3EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatListContainer: {
    paddingHorizontal: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    borderColor: '#FE660F',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuDescription: {
    fontSize: 14,
    color: 'gray',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FE660F',
    marginLeft: 10,
  },
});

export default FavScreen;
