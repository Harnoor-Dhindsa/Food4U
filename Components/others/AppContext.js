import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  const addToFavorites = (menu) => {
    setFavorites([...favorites, menu]);
  };

  const removeFromFavorites = (menu) => {
    setFavorites(favorites.filter((item) => item.id !== menu.id));
  };

  const addToCart = (menu, selectedPlan) => {
    setCart([...cart, { ...menu, selectedPlan }]);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
