import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from '../../../../_utils/FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileScreen = ({ navigation }) => {
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (user) {
      loadUserProfile();
      setEmail(user.email); // Set email to the user's email from Firebase Authentication
    }
  }, [user]);

  const loadUserProfile = async () => {
    const docRef = doc(FIREBASE_DB, 'ChefsProfiles', user.uid);
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
      console.log('No such document!');
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (user) {
      await setDoc(doc(FIREBASE_DB, 'ChefsProfiles', user.uid), {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        age,
        location,
        profilePic,
      });
      setEditMode(false);
    }
  };

  const handleLogOut = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        navigation.replace('Screen');
      })
      .catch(error => {
        alert("Error in logging out");
      });
  };

  const handleChoosePhoto = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
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
      console.log('Profile pic updated:', downloadURL);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      <View style={styles.profileContainer}>
        <Image key={profilePic} source={{ uri: profilePic }} style={styles.profilePhoto} />
        {editMode && (
          <TouchableOpacity style={styles.choosePhotoButton} onPress={handleChoosePhoto}>
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
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={[styles.input, styles.pickerContainer]}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                enabled={editMode}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, !editMode && styles.nonEditableText]}
              value={age}
              editable={editMode}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Age"
              placeholderTextColor="#ccc"
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
      </View>
      <View style={[styles.buttonContainer, editMode && styles.editModeButtonContainer]}>
        {editMode ? (
          <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogOut}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EDF3EB',
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  choosePhotoButton: {
    backgroundColor: '#FE660F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  infoContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  label: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#333',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 40,
  },
  picker: {
    height: 40,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  editModeButtonContainer: {
    justifyContent: 'center', // Center the button
  },
  button: {
    backgroundColor: '#FE660F',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nonEditableText: {
    backgroundColor: '#f0f0f0',
  },
});

export default ProfileScreen;
