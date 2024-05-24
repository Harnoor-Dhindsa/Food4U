import React from 'react';
import { View, Text, Button, StyleSheet, Image, FlatList } from 'react-native';

const ViewMenu = ({ route, navigation }) => {
  const { menu } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>{item.name}</Text>
      <Text>{item.quantity} {item.unit}</Text>
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
      <Button title="Edit Menu" onPress={() => navigation.navigate('EditMenu', { menu })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default ViewMenu;
