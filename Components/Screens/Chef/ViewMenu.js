import React from 'react';
import { View, Text, Button, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';

const ViewMenu = ({ route, navigation }) => {
  const { menu } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.quantity} {item.unit}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{menu.heading}</Text>
      {menu.avatar ? <Image source={{ uri: menu.avatar }} style={styles.image} /> : null}
      <Text style={styles.subheading}>Items</Text>
      <FlatList
        data={menu.items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <Text style={styles.subheading}>Dessert: {menu.dessert}</Text>
      <Text style={styles.subheading}>Available Days: {menu.days.join(', ')}</Text>
      <Text style={styles.subheading}>Daily Price: ${menu.dailyPrice}</Text>
      <Text style={styles.subheading}>Weekly Price: ${menu.weeklyPrice}</Text>
      <Text style={styles.subheading}>Monthly Price: ${menu.monthlyPrice}</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditMenu', { menu })}>
        <Text style={styles.editButtonText}>Edit Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE660F',
    textAlign: 'center',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    color: '#333',
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'center',
  },
  editButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ViewMenu;
