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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
        location,
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
          stripeAccountId: account.id,
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
              color="#4F603B"
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#4F603B" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={email}
            editable={false}
            placeholder="Email"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="phone" size={24} color="#4F603B" />
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
          <MaterialIcons name="wc" size={24} color="#4F603B" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={gender}
            editable={editMode}
            onChangeText={setGender}
            placeholder="Gender"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={24} color="#4F603B" />
          <TextInput
            style={[styles.input, !editMode && styles.nonEditableText]}
            value={location}
            editable={editMode}
            onChangeText={setLocation}
            placeholder="Location"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="cake" size={24} color="#4F603B" />
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
      {editMode ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
            <Text style={styles.buttonText}>Confirm Changes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLogOut}>
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={createStripeAccount}>
              <Text style={styles.buttonText}>Create Stripe Account</Text>
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
    marginTop: 70,
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
    borderWidth: 2,
    borderColor: "#4F603B",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 10,
    right: 5,
    backgroundColor: "#4F603B",
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
    color: '#4F603B',  // Ensures the inputs take up available space
  },
  editableInput: { // Ensures the inputs take up available space
    borderBottomWidth: 1,
    borderBottomColor: '#4F603B',
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
    borderBottomWidth: 1,
    borderBottomColor: "#4F603B",
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#4F603B",
  },
  nonEditableText: {
    color: "#4F603B",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#4F603B",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
