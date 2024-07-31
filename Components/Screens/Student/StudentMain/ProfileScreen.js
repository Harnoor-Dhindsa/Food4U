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
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import AntDesign from '@expo/vector-icons/AntDesign';

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
      setFirstName(profileData.firstName);
      setLastName(profileData.lastName);
      setPhoneNumber(profileData.phoneNumber);
      setGender(profileData.gender);
      setAge(profileData.age);
      setLocation(profileData.location);
      if (profileData.profilePic) {
        setProfilePic(profileData.profilePic);
      }
      if (profileData.notificationsEnabled !== undefined) {
        setNotificationsEnabled(profileData.notificationsEnabled);
      }
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
      const formattedAddress = `${addr.street}, ${addr.city}, ${addr.region}, ${addr.postalCode}, ${addr.country}`;
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <View style={styles.profileHeader}>
        <View style={styles.profilePhotoContainer}>
          <Image
            key={profilePic}
            source={{ uri: profilePic }}
            style={styles.profilePhoto}
          />
          {editMode && (
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={handleChoosePhoto}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.nameContainer}>
          {editMode ? (
            <>
              <TextInput
                style={[styles.name, styles.editableInput]}
                value={firstName}
                editable={editMode}
                onChangeText={setFirstName}
              />
              <TextInput
                style={[styles.name, styles.editableInput]}
                value={lastName}
                editable={editMode}
                onChangeText={setLastName}
              />
            </>
          ) : (
            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>
          )}
        </View>
        {!editMode && (
          <TouchableOpacity
            style={styles.topRightButton}
            onPress={handleEditProfile}
          >
            <AntDesign
              name={"edit"}
              size={26}
              color="#FE660F"
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={30} color="#e8c123" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={email}
            editable={false}
            placeholder="Email"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="phone" size={30} color="#0a50d1" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={phoneNumber}
            editable={editMode}
            onChangeText={handlePhoneNumberChange}
            placeholder="Phone Number"
            placeholderTextColor="#ccc"
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputContainer}>
  <MaterialIcons name="wc" size={30} color="#FE660F" />
  {editMode ? (
    <CustomModalPicker
      options={["Male", "Female"]}
      selectedValue={gender}
      onValueChange={setGender}
      enabled={editMode}
    />
  ) : (
    <TextInput
      style={[styles.input, !editMode && styles.nonEditableText]}
      value={gender}
      editable={editMode}
      onChangeText={setGender}
      placeholder="Gender"
      placeholderTextColor="#ccc"
    />
  )}
</View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="cake" size={30} color="#d10a67" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={age}
            editable={editMode}
            onChangeText={setAge}
            placeholder="Age"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={30} color="#d10a2b" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={location}
            editable={editMode}
            onChangeText={setLocation}
            placeholder="Location"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.NotificationsContainer}>
        <Ionicons name="notifications" size={30} color="#f7dc0a" />
          <Text style={styles.inputSetting}>Notifications:</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>
        <View style={styles.PolicyContainer}>
          <MaterialIcons name="policy" size={30} color="#0f0fdb" />
          <Text style={styles.inputSetting}>Policy</Text>
          <AntDesign name="arrowright" size={30} color="#000" />
        </View>
      </View>
      {editMode ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
            <Text style={styles.buttonText}>Confirm Changes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.Logoutbutton} onPress={handleLogOut}>
              <Text style={styles.LogoutbuttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#EDF3EB",
  },
  profileHeader: {
    marginTop: 45,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profilePhotoContainer: {
    position: "relative",
    marginRight: 15,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#FE660F",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 10,
    right: 5,
    backgroundColor: "#FE660F",
    borderRadius: 50,
    padding: 5,
  },
  topRightButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 10,
    borderRadius: 50,
  },
  nameContainer: {
    flexDirection: 'row',  // Aligns children in a row
    alignItems: 'center',  // Vertically centers children
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE660F',  // Ensures the inputs take up available space
  },
  editableInput: { // Ensures the inputs take up available space
    borderBottomWidth: 1,
    borderBottomColor: '#FE660F',
    borderRadius: 5,
    padding: 3,
    marginVertical: 5,
    backgroundColor: '#EDF3EB',
  },
  infoContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 5,
    paddingVertical: 5,
    height: 43,
    borderRadius: 5,
    backgroundColor: "#EDF3EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4, // This is for Android
  },
  NotificationsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 100,
    paddingVertical: 5,
  },
  PolicyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  inputSetting: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
  nonEditableText: {
    color: "#000",
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FE660F",
    padding: 15,
    borderRadius: 5,
    marginBottom: 2,
    width: "100%",
    alignItems: "center",
  },
  Logoutbutton: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#FE660F",
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  LogoutbuttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
