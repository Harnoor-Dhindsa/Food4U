import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewScreen = ({ route, navigation }) => {
  const { menu, selectedPlan } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleRatingPress = (value) => {
    setRating(value);
  };

  const submitReview = async () => {
    if (rating === 0 || review === '') {
      Alert.alert('Error', 'Please provide a rating and a review');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuId: menu.id,
          rating,
          review,
        }),
      });

      if (response.ok) {
        Alert.alert('Thank you for the review', '', [
          { text: 'OK', onPress: () => navigation.navigate('StudentHomeScreen') },
        ]);
      } else {
        Alert.alert('Error', 'Failed to submit review');
      }
    } catch (error) {
        Alert.alert('Thank you for the review', '', [
            { text: 'OK', onPress: () => navigation.navigate('StudentHomeScreen') },
          ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDF3EB" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FE660F" />
        </TouchableOpacity>
        <Text style={styles.heading}>Review Your Order</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subheading}>Rate your experience</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => handleRatingPress(value)}>
              <Ionicons
                name={rating >= value ? 'star' : 'star-outline'}
                size={32}
                color="#FE660F"
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.subheading}>Write a review</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Write your review here..."
          multiline
          value={review}
          onChangeText={setReview}
        />
        <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
          <Text style={styles.submitButtonText}>Send Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF3EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#EDF3EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#FE660F',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  reviewInput: {
    height: 100,
    borderColor: '#FE660F',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFF',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FE660F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default ReviewScreen;
