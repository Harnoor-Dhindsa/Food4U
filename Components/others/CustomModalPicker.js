import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CustomModalPicker = ({ label, data, value, onValueChange }) => {
  if (!data || !Array.isArray(data)) {
    console.error("Data is not defined or not an array");
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ marginBottom: 5 }}>{label}</Text>
      <Picker selectedValue={value} onValueChange={onValueChange}>
        {data.map((item) => (
          <Picker.Item key={item.key} label={item.label} value={item.key} />
        ))}
      </Picker>
    </View>
  );
};

export default CustomModalPicker;
