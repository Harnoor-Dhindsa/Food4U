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
import { Ionicons, MaterialIcons, AntDesign, FontAwesome, Entypo, SimpleLineIcons, Fontisto, Octicons } from "@expo/vector-icons";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  FIREBASE_STORAGE,
} from "../../../../_utils/FirebaseConfig";
import { sendPasswordResetEmail, getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification, signOut, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, getFirestore, collection, getDocs, query, where, addDoc  } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomModalPicker from "../../../others/CustomModalPicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [view, setView] = useState("profile");
  const [orderCount, setOrderCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('Not Verified');

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
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setPhoneNumber(profileData.phoneNumber || "");
      setGender(profileData.gender || "");
      setAge(profileData.age || "");
      setLocation(profileData.location || "");
      setProfilePic(profileData.profilePic || null);
      setNotificationsEnabled(profileData.notificationsEnabled || true);
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
        const userRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
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
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission for notifications was denied");
        setNotificationsEnabled(false);
        return; // Exit early if permissions are not granted
      }
  
      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync();
      
      // Update the user's profile with the token
      if (user) {
        const profileData = {
          notificationsEnabled: value,
          expoPushToken: token, // Store the actual push token
        };
  
        const userRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
        await setDoc(userRef, profileData, { merge: true });
      }
    } else {
      // Disable notifications and clear the push token
      if (user) {
        const profileData = {
          notificationsEnabled: value,
          expoPushToken: null, // Set token to null when notifications are disabled
        };
  
        const userRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
        await setDoc(userRef, profileData, { merge: true });
      }
    }
  };
  

  const handleViewChange = (view) => {
    setView(view);
  };

  const handleBackPress = () => {
    setView("profile"); // Go back to profile view
  };

  const handlePasswordReset = () => {
    Alert.alert(
      "Reset Password",
      "Are you sure you want to reset your password?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Password reset cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await sendPasswordResetEmail(FIREBASE_AUTH, email);
              alert("Password reset email sent!");
            } catch (error) {
              console.log(error);
              alert(
                "Failed to send password reset email. Please check your email address."
              );
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleDeleteUser = async () => {
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;
  
    if (!user) {
      alert("No user is currently signed in.");
      return;
    }
  
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Account deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // Prompt user to enter their password for reauthentication
            Alert.prompt(
              "Reauthenticate",
              "Please enter your password to confirm:",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Reauthentication cancelled"),
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: async (inputPassword) => {
                    try {
                      const credential = EmailAuthProvider.credential(
                        user.email,
                        inputPassword
                      );
                      await reauthenticateWithCredential(user, credential);
  
                      // Delete user data from Firestore
                      const userDoc = doc(firestore, "ChefsProfiles", user.uid);
                      await deleteDoc(userDoc);
  
                      // Delete the user from Firebase Authentication
                      await deleteUser(user);
                      alert("Your account and data have been deleted.");
                      navigation.replace("Screen"); // Navigate to the login screen
                    } catch (error) {
                      console.error("Error deleting user: ", error);
                      alert("Failed to delete the account. Please try again.");
                    }
                  },
                },
              ],
              "secure-text"
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  const updateUserEmail = async (newEmail, currentPassword) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert("No user is currently signed in.");
      return;
    }
  
    // Reauthenticate User
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
  
      // Update Email in Firebase Authentication
      await updateEmail(user, newEmail);
      alert("Email updated successfully. Please verify your new email address.");
  
      // Update Email in Firestore
      const userRef = doc(FIREBASE_DB, "ChefsProfiles", user.uid);
      await setDoc(userRef, { email: newEmail }, { merge: true });
      
    } catch (error) {
      console.error("Error updating email: ", error);
      alert("Failed to update email. Please try again.");
    }
  };
  
  const handleChangeEmail = () => {
    Alert.prompt(
      "Reauthenticate",
      "Please enter your current password:",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Reauthentication cancelled"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (currentPassword) => {
            Alert.prompt(
              "Change Email",
              "Please enter your new email address:",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Email change cancelled"),
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: async (newEmail) => {
                    if (newEmail) {
                      await updateUserEmail(newEmail, currentPassword);
                    } else {
                      alert("Please enter a valid email address.");
                    }
                  },
                },
              ],
              "plain-text"
            );
          },
        },
      ],
      "secure-text"
    );
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.error('No user is logged in');
          return;
        }

        const currentUserId = currentUser.uid;

        // Create a query against the collection with a where clause
        const ordersCollection = collection(FIREBASE_DB, 'orders');
        const ordersQuery = query(ordersCollection, where('chefId', '==', currentUserId));
        const querySnapshot = await getDocs(ordersQuery);

        // Count the number of orders
        setOrderCount(querySnapshot.size);

        // Calculate the total earnings
        let total = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          total += data.totalPrice || 0; // Ensure totalPrice exists and is a number
        });
        setTotalEarnings(total);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleEmailPress = async () => {
    const toEmail = 'food4u@gmail.com';
    const subject = 'Support Request';
    const body = 'Hi, I need help with my account. Can you please assist me?';

    const mailtoUrl = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Email client is not available');
      }
    } catch (error) {
      console.error('An error occurred', error);
      Alert.alert('An error occurred while trying to open the email client');
    }
  };

  useEffect(() => {
    const checkPendingVerification = async () => {
      if (user && user.uid) {
        const docRef = doc(FIREBASE_DB, 'PendingVerification', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVerificationStatus('Pending Verification');
        }
      }
    };

    checkPendingVerification();
  }, [user]);

  const handleVerifyAccount = async () => {
    Alert.alert(
      'Upload Document',
      'Please upload your certificate.',
      [
        {
          text: 'Upload',
          onPress: pickDocument
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      console.log('DocumentPicker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri, name } = result.assets[0];
        console.log('Document URI:', uri);
        console.log('Document Name:', name);

        if (!uri) {
          Alert.alert('Invalid Document', 'No document URI found.');
          return;
        }

        try {
          const response = await fetch(uri);
          console.log('Fetch response:', response);
          const blob = await response.blob();

          const storageRef = ref(FIREBASE_STORAGE, `verificationDocs/${user.uid}`);
          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          await addDoc(collection(FIREBASE_DB, 'PendingVerification', user.uid, "documents"), {
            name: name,
            url: downloadURL,
            uploadedAt: new Date(),
          });

          setVerificationStatus('Pending Verification');
          Alert.alert('Upload Successful', 'Document uploaded successfully! Please wait for verification.');
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          Alert.alert('Error', 'Error fetching document: ' + fetchError.message);
        }
      } else {
        Alert.alert('Invalid Document', 'Please select a valid document (PDF).');
        console.log('Invalid document selection:', result);
      }
    } catch (error) {
      console.error('Error during document pick/upload:', error);
      Alert.alert('Error', 'Error during document pick/upload: ' + error.message);
    }
  };
  
  
  
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"></StatusBar>
      <View style={styles.header}>
      {view === "account" ? (
          <View style={styles.backbutton}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.name}> Account Info</Text>
        </View>
        ) : view === "settings" ? (
          <View style={styles.backbutton}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <Text style={styles.name}> Settings</Text>
          </View>
        ) : view === "faqs" ? (
          <View style={styles.backbutton}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <Text style={styles.name}> FAQs</Text>
          </View>
        ) : (
          <View style={styles.profileHeader}>
            <Image
              source={profilePic ? { uri: profilePic } : require("../../../Images/DefaultProfile.png")}
              style={styles.mprofilePhoto}
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
          <Text style={styles.buttonText}>{orderCount}</Text>
            <Text style={styles.buttonText}>Menu Sold</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>$ {totalEarnings.toFixed(2)}</Text>
            <Text style={styles.buttonText}>Total Earn</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.option} onPress={() => handleViewChange("account")}>
          <View style={styles.optionContent}>
            <Ionicons name="information-circle-outline" size={24} color="black" />
            <Text style={styles.optionText}>Account</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionContent}>
            <Ionicons name="person-add-outline" size={24} color="black" />
            <Text style={styles.optionText}>Invite Friends</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionContent}>
            <Ionicons name="document-text-outline" size={24} color="black" />
            <Text style={styles.optionText}>Policies</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => handleViewChange("faqs")}>
              <View style={styles.optionContent}>
                <AntDesign name="questioncircleo" size={24} color="black" />
                <Text style={styles.optionText}>FAQs</Text>
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
              <TouchableOpacity style={styles.aprofilePhoto}>
                <Image
                  source={profilePic ? { uri: profilePic } : require("../../../Images/DefaultProfile.png")}
                  style={styles.profilePhoto}
                />
                <TouchableOpacity onPress={handleChoosePhoto} style={styles.choosephoto}>
                <Entypo name="camera" size={20} color="black" />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>First Name:</Text>
              </View>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>Last Name:</Text>
              </View>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>Email:</Text>
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                editable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>Phone Number:</Text>
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>Gender:</Text>
              </View>
              <CustomModalPicker
               options={["Male", "Female"]}
               selectedValue={gender}
               onValueChange={setGender}
               enabled={editMode}
              />
            </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>Age:</Text>
              </View>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                keyboardType="numeric"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.aoptionText}>Location:</Text>
              </View>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Location"
              />
            </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.aprofilePhoto}>
                <Image
                  source={profilePic ? { uri: profilePic } : require("../../../Images/DefaultProfile.png")}
                  style={styles.profilePhoto}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
                <Ionicons name="person" size={24} color="black" />
                <Text style={styles.aoptionText}>Name:</Text>
              </View>
              <Text>{firstName} {lastName}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
              <Entypo name="email" size={24} color="black" />
                <Text style={styles.aoptionText}>Email:</Text>
              </View>
              <Text>{email}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
              <FontAwesome name="phone" size={24} color="black" />
                <Text style={styles.aoptionText}>Phone Number:</Text>
              </View>
              <Text>{phoneNumber}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
              <Ionicons name="male-female-sharp" size={24} color="black" />
                <Text style={styles.aoptionText}>Gender:</Text>
              </View>
              <Text>{gender}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
              <FontAwesome name="birthday-cake" size={24} color="black" />
                <Text style={styles.aoptionText}>Age:</Text>
              </View>
              <Text>{age}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View style={styles.optionContent}>
              <Ionicons name="location" size={24} color="black" />
                <Text style={styles.aoptionText}>Location:</Text>
              </View>
              <Text>{location}</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
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
            <TouchableOpacity style={styles.option} onPress={handleChangeEmail}>
              <View style={styles.optionContent}>
              <Fontisto name="email" size={24} color="black" />
                <Text style={styles.optionText}>Update Email</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handlePasswordReset}>
              <View style={styles.optionContent}>
                <Ionicons name="key-outline" size={24} color="black" />
                <Text style={styles.optionText}>Reset Password</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={createStripeAccount}>
              <View style={styles.optionContent}>
              <MaterialIcons name="payment" size={24} color="black" />
                <Text style={styles.optionText}>Stripe Account</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handleVerifyAccount} disabled={verificationStatus === 'Pending Verification'}>
      <View style={styles.optionContent}>
        <Octicons name={verificationStatus === 'Not Verified' ? "unverified" : "unverified"} size={24} color="black" />
        <Text style={styles.optionText}>{verificationStatus === 'Not Verified' ? "Verify Your Account" : "Pending Verification"}</Text>
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
            <TouchableOpacity style={styles.option} onPress={handleDeleteUser}>
              <View style={styles.optionContent}>
                <Ionicons name="trash-outline" size={24} color="red" />
                <Text style={styles.doptionText}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="black" />
            </TouchableOpacity>
          </ScrollView>
        )}
        {view === "faqs" && (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Text style={styles.headfaq}>Hi, How can we Help you</Text>
    
    <Text style={styles.question}>1. How do I reset my password?</Text>
    <Text style={styles.answer}>To reset your password, go to the Profile page and click on 'Settings' and click on the "Reset Password". Follow the instructions sent to your registered email address.</Text>
    
    <Text style={styles.question}>2. How do I track my order?</Text>
    <Text style={styles.answer}>You can track your order in the 'My Orders' section. Select the order you want to track to see the real-time status.</Text>
    
    <Text style={styles.question}>3. How do I update my delivery address?</Text>
    <Text style={styles.answer}>To update your delivery address, go to Profile Page and then "About" click on Edit Profile and edit or add a new address.</Text>
    
    <Text style={styles.question}>4. What are the payment options available?</Text>
    <Text style={styles.answer}>We only accept payment options including credit/debit cards in Future there will be Paypal, Apple Pay and Google Pay.</Text>
    
    <Text style={styles.question}>5. How do I contact customer support?</Text>
    <Text style={styles.answer}>You can contact our customer support through the 'Need more help'. We are available 24/7 to assist you.</Text>

    <TouchableOpacity style={styles.helpButton} onPress={handleEmailPress}>
      <Text style={styles.helpButtonText}>Need more help?</Text>
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
  headfaq: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#007BFF',
  },
  helpButton: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    width: 140,
    height: 140,
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FE660F",
  },
  mprofilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FE660F",
  },
  aprofilePhoto: {
    alignItems: "center",
    marginBottom: 20,
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
    backgroundColor: "#fff",
    borderColor: "#FE660F",
    borderWidth: 2,
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
    backgroundColor: "#FE660F",
    padding: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  doptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "red",
  },
  aoptionText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: "#FE660F",
    padding: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  choosephoto: {
    position: "absolute",
    bottom: 0,
    right: 140,
    backgroundColor: "#FE660F",
    padding: 5,
    borderRadius: 50,
  },
});

export default ProfileScreen;
