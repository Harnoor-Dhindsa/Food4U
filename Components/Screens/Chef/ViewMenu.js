import React from 'react';
import { View, Text, Button, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ViewMenu = ({ route, navigation }) => {
  const { menu } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.quantity}</Text>
    </View>
  );

  const renderDessert = () => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{menu.dessert}</Text>
      <Text style={styles.itemText}>{menu.dessertQuantity}</Text>
      <Text style={styles.itemText}>{menu.dessertDays}</Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      <Text style={styles.heading}>{menu.heading}</Text>
      <Text style={styles.subheading}>Items</Text>
    </>
  );

  const ListFooterComponent = () => (
    <>
      <Text style={styles.subheading}>Dessert</Text>
      {renderDessert()}

      <Text style={styles.subheading}>Available Days</Text>
      <View style={styles.daysContainer}>
        {menu.days &&
          menu.days.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
      </View>

      <Text style={styles.subheading}>Prices</Text>
      <View style={styles.priceTable}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Daily Price:</Text>
          <Text style={styles.priceValue}>${menu.dailyPrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Weekly Price:</Text>
          <Text style={styles.priceValue}>${menu.weeklyPrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Monthly Price:</Text>
          <Text style={styles.priceValue}>${menu.monthlyPrice}</Text>
        </View>
      </View>

      {menu.avatars && menu.avatars.length > 0 && (
        <View style={styles.imageContainer}>
          {menu.avatars.map((avatar, index) => (
            <Image key={index} source={{ uri: avatar }} style={styles.image} />
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate("EditMenu", { menu })}
      >
        <Icon name="edit" size={24} color="#fff" />
        <Text style={styles.editButtonText}>Edit Menu</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={menu.items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    marginVertical: 10,
    color: '#555',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  itemText: {
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  priceTable: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  priceLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  priceValue: {
    color: '#333',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  dayItem: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  dayText: {
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    margin: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ViewMenu;
