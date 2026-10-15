/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const countItems = (cartItems) =>
  (Array.isArray(cartItems) ? cartItems : []).reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

export const CartProvider = ({ children }) => {
  const { auth } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    if (!auth?.token) {
      setCartCount(0);
      return [];
    }

    try {
      const response = await getCart();
      const items = response?.data?.data || response?.data?.items || [];
      setCartCount(countItems(items));
      return items;
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      setCartCount(0);
      return [];
    }
  };

  const syncFromItems = (items) => {
    setCartCount(countItems(items));
  };

  useEffect(() => {
    refreshCart();
  }, [auth?.token]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, syncFromItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
