import React, { createContext, useState, useEffect } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../_utils/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [user, setUser] = useState(null);

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

  const initializeFavorites = async (userId) => {
    const userFavoritesRef = doc(FIREBASE_DB, 'Favorites', userId);
    const docSnap = await getDoc(userFavoritesRef);
    if (!docSnap.exists()) {
      await setDoc(userFavoritesRef, { favorites: [] });
    }
  };

  const initializeCart = async (userId) => {
    const userCartRef = doc(FIREBASE_DB, 'Carts', userId);
    const docSnap = await getDoc(userCartRef);
    if (!docSnap.exists()) {
      await setDoc(userCartRef, { cart: [] });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        setUser(user);
        await initializeFavorites(user.uid);
        await initializeCart(user.uid);
        fetchStudentData(user.uid);
      } else {
        setUser(null);
        setStudentData(null);
        setFavorites([]);
        setCart([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const userFavoritesRef = doc(FIREBASE_DB, 'Favorites', user.uid);
        const docSnap = await getDoc(userFavoritesRef);
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        }
      };

      const fetchCart = async () => {
        const userCartRef = doc(FIREBASE_DB, 'Carts', user.uid);
        const docSnap = await getDoc(userCartRef);
        if (docSnap.exists()) {
          setCart(docSnap.data().cart || []);
        }
      };

      fetchFavorites();
      fetchCart();
    }
  }, [user]);

  const addToFavorites = async (menu) => {
    try {
      const userFavoritesRef = doc(FIREBASE_DB, 'Favorites', user.uid);
      await updateDoc(userFavoritesRef, {
        favorites: arrayUnion(menu)
      });
      setFavorites((prev) => [...prev, menu]);
    } catch (error) {
      console.error("Error adding to favorites: ", error);
    }
  };

  const removeFromFavorites = async (menu) => {
    try {
      const userFavoritesRef = doc(FIREBASE_DB, 'Favorites', user.uid);
      await updateDoc(userFavoritesRef, {
        favorites: arrayRemove(menu)
      });
      setFavorites((prev) => prev.filter((item) => item.id !== menu.id));
    } catch (error) {
      console.error("Error removing from favorites: ", error);
    }
  };

  const addToCart = async (menu, selectedPlan) => {
    const price = (() => {
      switch (selectedPlan) {
        case "daily":
          return menu.dailyPrice;
        case "weekly":
          return menu.weeklyPrice;
        case "monthly":
          return menu.monthlyPrice;
        default:
          return 0;
      }
    })();
  
    const cartItem = { ...menu, selectedPlan, price };
  
    try {
      const userCartRef = doc(FIREBASE_DB, 'Carts', user.uid);
      const docSnap = await getDoc(userCartRef);
  
      if (docSnap.exists()) {
        // If the document exists, update it
        await updateDoc(userCartRef, {
          cart: arrayUnion(cartItem),
        });
      } else {
        // If the document does not exist, create it
        await setDoc(userCartRef, {
          cart: [cartItem],
        });
      }
  
      setCart((prevCart) => [...prevCart, cartItem]);
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
  };
  

  const removeFromCart = async (menu) => {
    try {
      const userCartRef = doc(FIREBASE_DB, 'Carts', user.uid);
      await updateDoc(userCartRef, {
        cart: arrayRemove(menu)
      });
      setCart((prevCart) =>
        prevCart.filter(
          (item) => item.id !== menu.id || item.selectedPlan !== menu.selectedPlan
        )
      );
    } catch (error) {
      console.error("Error removing from cart: ", error);
    }
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
        studentData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
