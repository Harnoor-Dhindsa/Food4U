import React, { useState } from 'react';
import { View, Text, Button} from 'react-native';
import { FIREBASE_AUTH } from '../../../../_utils/FirebaseConfig';

const ProfileScreen = ({navigation}) => {
  const [logoutError, setLogoutError] = useState(null);

  const LogOut = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        navigation.replace('Screen');
      })
      .catch(error => {
        alert("Error in logging out")
      });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Profile!</Text>
      <Button
        onPress={LogOut}
        title="LogOut"
        color="#000"
      />
    </View>
  );
};

export default ProfileScreen;
