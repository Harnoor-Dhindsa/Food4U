import React, { useState, useEffect } from "react";
import { Linking } from "react-native";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Switch,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons, AntDesign, FontAwesome, Entypo } from "@expo/vector-icons";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  FIREBASE_STORAGE,
} from "../../../../_utils/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomModalPicker from "../../../others/CustomModalPicker";
import axios from "axios";

const ProfileScreen = ({ navigation }) => {
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [view, setView] = useState("profile");

  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (user) {
      loadUserProfile();
      setEmail(user.email); // Set email to the user's email from Firebase Authentication
    }
  }, [user]);

  const loadUserProfile = async () => {
    const docRef = doc(FIREBASE_DB, "StudentsProfiles", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profileData = docSnap.data();
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setPhoneNumber(profileData.phoneNumber || "");
      setGender(profileData.gender || "");
      setAge(profileData.age || "");
      setLocation(profileData.location || "");
      setProfilePic(profileData.profilePic || null);
      setNotificationsEnabled(profileData.notificationsEnabled || false);
    } else {
      console.log("No such document!");
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (user) {
      const profileData = {
        profilePic,
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        age,
        location,
        notificationsEnabled,
      };

      try {
        const userRef = doc(FIREBASE_DB, "StudentsProfiles", user.uid);
        await setDoc(userRef, profileData, { merge: true });
        setEditMode(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            FIREBASE_AUTH.signOut()
              .then(() => {
                navigation.replace('Screen'); // Replace 'Screen' with the actual screen name you want to navigate to
              })
              .catch((error) => {
                alert('Error in logging out');
              });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChoosePhoto = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const storageRef = ref(FIREBASE_STORAGE, `profilePics/${user.uid}`);
      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setProfilePic(downloadURL);
      console.log("Profile pic updated:", downloadURL);
    }
  };

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    let address = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (address.length > 0) {
      const addr = address[0];
      const formattedAddress = `${addr.street}, ${addr.city}`;
      setLocation(formattedAddress);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const formatPhoneNumber = (text) => {
    const cleaned = ("" + text).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 ${match[1]}-${match[2]}-${match[3]}`;
    }
    return text;
  };

  const handlePhoneNumberChange = (text) => {
    if (text && text.length >= (phoneNumber ? phoneNumber.length : 0)) {
      setPhoneNumber(formatPhoneNumber(text));
    } else {
      setPhoneNumber(text);
    }
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission for notifications was denied");
        setNotificationsEnabled(false);
      }
    }

    if (user) {
      const profileData = {
        notificationsEnabled: value,
      };

      const userRef = doc(FIREBASE_DB, "StudentsProfiles", user.uid);
      await setDoc(userRef, profileData, { merge: true });
    }
  };

  const handleViewChange = (view) => {
    setView(view);
  };

  const handleBackPress = () => {
    setView("profile"); // Go back to profile view
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"></StatusBar>
      <View style={styles.header}>
      {view === "account" ? (
          <View style={styles.backbutton}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.name}>Account Info</Text>
        </View>
        ) : view === "settings" ? (
          <View style={styles.backbutton}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.name}>Settings</Text>
          </View>
        ) : (
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: profilePic || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg" }}
              style={styles.profilePhoto}
            />
            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>
          </View>
        )}
      </View>

      {view === "profile" && (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button}>
          <Ionicons name="receipt" size={24} color="black" />
            <Text style={styles.buttonText}>Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
          <FontAwesome name="trophy" size={24} color="black" />
            <Text style={styles.buttonText}>Reward</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.option} onPress={() => handleViewChange("account")}>
          <View style={styles.optionContent}>
            <Ionicons name="information-circle-outline" size={24} color="black" />
            <Text style={styles.optionText}>Account</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.option}>
          <View style={styles.optionContent}>
            <Ionicons name="person-add-outline" size={24} color="black" />
            <Text style={styles.optionText}>Invite Friends</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </View>
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionContent}>
            <Ionicons name="document-text-outline" size={24} color="black" />
            <Text style={styles.optionText}>Policies</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => handleViewChange("settings")}>
          <View style={styles.optionContent}>
            <Ionicons name="settings-outline" size={24} color="black" />
            <Text style={styles.optionText}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
      </ScrollView>
    )}
    {view === "account" && (
        <ScrollView contentContainerStyle={styles.form}>
        {editMode ? (
            <View style={styles.editForm}>
              <TouchableOpacity onPress={handleChoosePhoto}>
                <Image
                  source={{ uri: profilePic || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg" }}
                  style={styles.profilePhoto}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
              />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
              />
              <TextInput
                style={styles.input}
                value={email}
                placeholder="Email"
                editable={false} // Make email field non-editable
              />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
              <CustomModalPicker
                label={"Gender"}
                data={[
                  { key: "Male", label: "Male" },
                  { key: "Female", label: "Female" },
                ]}
                value={gender}
                onValueChange={(value) => setGender(value)}
              />
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Location"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity onPress={handleChoosePhoto}>
                <Image
                  source={{ uri: profilePic || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg" }}
                  style={styles.profilePhoto}
                />
              </TouchableOpacity>
              <Text style={styles.text}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.text}>Email: {email}</Text>
              <Text style={styles.text}>Phone Number: {phoneNumber}</Text>
              <Text style={styles.text}>Gender: {gender}</Text>
              <Text style={styles.text}>Age: {age}</Text>
              <Text style={styles.text}>Location: {location}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    {view === "settings" && (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.option}>
              <View style={styles.optionContent}>
                <Ionicons name="notifications-outline" size={24} color="black" />
                <Text style={styles.optionText}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
              />
            </View>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Ionicons name="key-outline" size={24} color="black" />
                <Text style={styles.optionText}>Reset Password</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handleLogOut}>
              <View style={styles.optionContent}>
                <Ionicons name="log-out-outline" size={24} color="black" />
                <Text style={styles.optionText}>Log Out</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Ionicons name="trash-outline" size={24} color="black" />
                <Text style={styles.optionText}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
          </ScrollView>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backbutton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginHorizontal: 5,
    height: 100,
  },
  buttonText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  form: {
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProfileScreen;
