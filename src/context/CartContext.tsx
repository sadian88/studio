
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// Define the structure of a cart item
export interface CartItem {
  id: string; // Composite ID: `${shirtTypeId}-${colorId}-${designId}`
  shirtType: { id: string; name: string; imgSrc: string };
  color: { id: string; name: string; hex: string };
  design: { id: string; name: string; imgSrc: string };
  quantity: number;
  price: number; // Price per unit
}

// Define the shape of the cart context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'id' | 'price'> & { price?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Define actions for the reducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };

// Reducer function to manage cart state
const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) } // Prevent negative quantity
          : item
      ).filter(item => item.quantity > 0); // Remove item if quantity is 0
    case 'CLEAR_CART':
      return [];
    case 'SET_CART':
      return action.payload;
    default:
      return state;
  }
};

const CART_STORAGE_KEY = 'flashprint_cart';

// CartProvider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [], () => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback((itemData: Omit<CartItem, 'quantity' | 'id' | 'price'> & { price?: number }) => {
    const itemId = `${itemData.shirtType.id}-${itemData.color.id}-${itemData.design.id}`;
    // For now, let's set a default price if not provided
    const price = itemData.price || 25; // Default price
    const newItem: CartItem = {
      ...itemData,
      id: itemId,
      price,
      quantity: 1, // Always add one unit at a time, quantity is incremented in reducer if exists
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
