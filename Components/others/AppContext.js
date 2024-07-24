import React, { createContext, useState, useEffect } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../_utils/FirebaseConfig"; // Make sure the path to firebase config file is correct
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [studentData, setStudentData] = useState(null); // State to store student data

  // Function to fetch student data from Firestore
  const fetchStudentData = async (studentId) => {
    try {
      const studentDoc = await getDoc(doc(FIREBASE_DB, "StudentsProfiles", studentId));
      if (studentDoc.exists()) {
        setStudentData(studentDoc.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching student data: ", error);
    }
  };

  // Monitor authentication state and fetch student data upon login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        fetchStudentData(user.uid); // Fetch student data using the user's uid
      } else {
        setStudentData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const addToFavorites = (menu) => {
    setFavorites([...favorites, menu]);
  };

  const removeFromFavorites = (menu) => {
    setFavorites(favorites.filter((item) => item.id !== menu.id));
  };

  const addToCart = (menu, selectedPlan) => {
    let price = 0;
    switch (selectedPlan) {
      case "daily":
        price = menu.dailyPrice;
        break;
      case "weekly":
        price = menu.weeklyPrice;
        break;
      case "monthly":
        price = menu.monthlyPrice;
        break;
      default:
        price = 0;
    }
    setCart([...cart, { ...menu, selectedPlan, price }]);
  };

  const removeFromCart = (menu) => {
    setCart(
      cart.filter(
        (item) => item.id !== menu.id || item.selectedPlan !== menu.selectedPlan
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        cart,
        addToCart,
        removeFromCart,
        studentData, // Providing student data in context
      }}
    >
      {children}
    </AppContext.Provider>
  );
};