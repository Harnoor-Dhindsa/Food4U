import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width: viewportWidth } = Dimensions.get("window");

const SelectionScreen = ({ navigation }) => {
  const entries = [
    {
      title: "Chef",
      subtitle:
        "Cooking requires confident guesswork and improvisation—experimentation and substitution, dealing with failure and uncertainty in a creative way.",
      image: require("../Images/chef.png"),
      onPress: () => navigation.navigate("ChefSignup"),
    },
    {
      title: "Student",
      subtitle:
        "Hi! I would like to have some delicious food. Can you help me?",
      image: require("../Images/student.png"),
      onPress: () => navigation.navigate("StudentSignup"),
    },
    {
      title: "Admin",
      subtitle:
        "Administrative access for approving menus and verifying chefs.",
      image: require("../Images/admin.png"), // Replace with admin icon image
      onPress: () => navigation.navigate("AdminLogin"), // Replace with admin signin navigation
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Yourself</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContainer}
      >
        {entries.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={item.onPress}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    backgroundColor: "#EDF3EB",
  },
  heading: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 40,
    marginTop: 50,
    color: "#000",
    fontFamily: "poppins",
  },
  scrollViewContainer: {
    marginBottom: 100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  option: {
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 150,
    borderColor: "#FE660F",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: viewportWidth * 0.75,
    height: viewportWidth * 1.5,
    marginHorizontal: viewportWidth * 0.125,
  },
  image: {
    width: 160,
    height: 180,
    marginBottom: 20,
    borderRadius: 0,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    paddingHorizontal: 10,
  },
});

export default SelectionScreen;