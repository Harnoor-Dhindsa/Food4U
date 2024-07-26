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
} from "react-native";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  FIREBASE_STORAGE,
} from "../../../../_utils/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
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

  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (user) {
      loadUserProfile();
      setEmail(user.email); // Set email to the user's email from Firebase Authentication
    }
  }, [user]);

  const loadUserProfile = async () => {
    const docRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
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
        location,// Include the Stripe account ID
      };

      try {
        const userRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
        await setDoc(userRef, profileData, { merge: true });
        setEditMode(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };


  const handleLogOut = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        navigation.replace("Screen");
      })
      .catch((error) => {
        alert("Error in logging out");
      });
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
    // Remove all non-numeric characters
    const cleaned = ("" + text).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 ${match[1]}-${match[2]}-${match[3]}`;
    }
    return text;
  };

  const handlePhoneNumberChange = (text) => {
    // Only format if the text is not being deleted and is defined
    if (text && text.length >= (phoneNumber ? phoneNumber.length : 0)) {
      setPhoneNumber(formatPhoneNumber(text));
    } else {
      setPhoneNumber(text);
    }
  };

  const createStripeAccount = async () => {
    try {
      const response = await axios.post(
        "http://192.168.1.74:3000/create-connected-account",
        { email }
      );
      const { account } = response.data;

      const accountLinkResponse = await axios.post(
        "http://192.168.1.74:3000/create-account-link",
        { account_id: account.id }
      );

      const { accountLink } = accountLinkResponse.data;

      Alert.alert("Stripe Connect", "Please complete the onboarding process.", [
        {
          text: "Open Stripe",
          onPress: () => Linking.openURL(accountLink.url),
        },
      ]);

      // Save the Stripe account ID in the user's profile
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
          stripeAccountId: account.id, // Save the Stripe account ID
        };

        const userRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
        await setDoc(userRef, profileData, { merge: true });
      }
    } catch (error) {
      console.error("Error creating Stripe connected account:", error);
      Alert.alert(
        "Error",
        "There was an error creating the Stripe connected account."
      );
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <View style={styles.profileContainer}>
        <Image
          key={profilePic}
          source={{ uri: profilePic }}
          style={styles.profilePhoto}
        />
        {editMode && (
          <TouchableOpacity
            style={styles.choosePhotoButton}
            onPress={handleChoosePhoto}
          >
            <Text style={styles.buttonText}>Choose Photo</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !editMode && styles.nonEditableText]}
              value={firstName}
              editable={editMode}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !editMode && styles.nonEditableText]}
              value={lastName}
              editable={editMode}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#ccc"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={email}
            editable={false} // Make email field non-editable
            placeholder="Email"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={phoneNumber}
            editable={editMode}
            onChangeText={handlePhoneNumberChange}
            placeholder="Phone Number"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <CustomModalPicker
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
              ]}
              selectedValue={gender}
              onValueChange={setGender}
              enabled={editMode}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
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
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={location}
            editable={editMode}
            onChangeText={setLocation}
            placeholder="Location"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.buttonContainer}>
          {editMode ? (
            <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={handleLogOut}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        {!editMode && (
          <TouchableOpacity style={styles.button} onPress={createStripeAccount}>
            <Text style={styles.buttonText}>Create Stripe Account</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#EDF3EB",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#5D3FD3",
  },
  choosePhotoButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#5D3FD3",
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    flex: 1,
    marginBottom: 10,
    paddingRight: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#EDF3EB",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#333",
  },
  nonEditableText: {
    backgroundColor: "#F0F0F0",
    color: "#999",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    backgroundColor: "#5D3FD3",
    borderRadius: 5,
    width: "48%",
  },
});

export default ProfileScreen;
