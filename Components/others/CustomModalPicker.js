import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const CustomModalPicker = ({ options, selectedValue, onValueChange, enabled }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => enabled && setModalVisible(true)}
        style={styles.input}
      >
        <Text style={styles.inputText}>{selectedValue || 'Select Gender'}</Text>
      </TouchableOpacity>
      {enabled && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.option}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.option, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.optionText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputText: {
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  option: {
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  cancelButton: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  cancelText: {
    color: 'red',
  },
});

export default CustomModalPicker;
