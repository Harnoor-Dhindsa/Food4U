import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ViewMenu = ({ route, navigation }) => {
  const { menu } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemQuantity}>{item.quantity}</Text>
    </View>
  );

  const renderDessert = () => (
    <View style={styles.listItem}>
      <Text style={styles.itemName}>{menu.dessert}</Text>
      <Text style={styles.itemQuantity}>{menu.dessertQuantity}</Text>
      <Text style={styles.itemQuantity}>{menu.dessertDays}</Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#FE660F" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>{menu.heading}</Text>
    </>
  );

  const ListFooterComponent = () => (
    <>
      <Text style={styles.subheading}>Dessert</Text>
      {menu.dessert && renderDessert()}

      <Text style={styles.subheading}>Available Days</Text>
      <View style={styles.daysContainer}>
        {menu.days.map((day, index) => (
          <Text key={index} style={styles.dayItem}>
            {day}
          </Text>
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

      <Text style={styles.subheading}>Pickup & Delivery</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            menu.pickup ? styles.selectedOption : styles.unselectedOption,
          ]}
          disabled={!menu.pickup}
        >
          <Text style={styles.optionText}>Pickup</Text>
          {menu.pickup && (
            <Text style={styles.optionText}>Address: {menu.pickupAddress}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            menu.delivery ? styles.selectedOption : styles.unselectedOption,
          ]}
          disabled={!menu.delivery}
        >
          <Text style={styles.optionText}>Delivery</Text>
        </TouchableOpacity>
      </View>

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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F7F7",
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#FE660F",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FE660F",
    textAlign: "center",
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    color: "#333",
    marginVertical: 10,
    fontWeight: "bold",
  },
  listItem: {
    padding: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemName: {
    color: "#333",
    flex: 1,
  },
  itemQuantity: {
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
  },
  priceTable: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  priceLabel: {
    fontWeight: "bold",
    color: "#FE660F",
  },
  priceValue: {
    color: "#333",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  dayItem: {
    backgroundColor: "#FE660F",
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
    color: "#fff",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    margin: 5,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: "#FE660F",
  },
  unselectedOption: {
    backgroundColor: "#F2F2F2",
  },
  optionText: {
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ViewMenu;
