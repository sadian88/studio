
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// Define the structure of a cart item
export interface CartItem {
  id: string; // Composite ID: `${shirtTypeId}-${colorId}-${designIdOrAiIdentifier}`
  shirtType: { id: string; name: string; imgSrc: string };
  color: { id: string; name: string; hex: string };
  design: { id: string; name: string; imgSrc: string; hint?: string }; // hint for data-ai-hint
  quantity: number;
  price: number; // Price per unit
  aiPrompt?: string; // Optional field for AI design description
}

// Define the shape of the cart context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
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
      // For AI prompts, if an item with the same base (shirt, color) and 'ai-generated' design exists,
      // and the prompt is the same, increment quantity. Otherwise, it's a new item.
      // For pre-made designs, use the payload.id.
      const isAiItem = action.payload.design.id === 'ai-generated';
      const existingItemIndex = state.findIndex(item => {
        if (isAiItem && item.design.id === 'ai-generated') {
          return item.shirtType.id === action.payload.shirtType.id &&
                 item.color.id === action.payload.color.id &&
                 item.aiPrompt === action.payload.aiPrompt;
        }
        return item.id === action.payload.id;
      });

      if (existingItemIndex > -1) {
        return state.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      // If it's a new item (or AI item with a new prompt/combo), add it.
      // The ID passed in action.payload should be unique enough (generated in CustomizeOrder).
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0); 
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
      try {
        return storedCart ? JSON.parse(storedCart) : [];
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback((itemData: Omit<CartItem, 'quantity' | 'id'>) => {
    // Generate a unique ID for the cart item here.
    // This ID determines if an item is "the same" for quantity updates.
    let itemId: string;
    if (itemData.design.id === 'ai-generated' && itemData.aiPrompt) {
      // For AI items, include a hash or snippet of the prompt for uniqueness, or a timestamp for true uniqueness
      // For simplicity now, if it's AI, make it unique enough to be a new item unless prompt is identical.
      // A truly robust hash of the prompt would be better for production.
      // For this iteration, let's assume CustomizeOrder provides a sufficiently unique ID for AI items if needed,
      // or that same AI prompt for same base product should increment quantity.
      // The reducer logic already handles checking aiPrompt for equality for 'ai-generated' designs.
      itemId = `${itemData.shirtType.id}-${itemData.color.id}-${itemData.design.id}`
      if (itemData.aiPrompt) { // Append prompt to distinguish between different AI ideas for same base
         itemId += `-${itemData.aiPrompt.substring(0,10).replace(/\s/g, '')}`; // Basic uniqueness
      }
    } else {
      itemId = `${itemData.shirtType.id}-${itemData.color.id}-${itemData.design.id}`;
    }
    
    const newItem: CartItem = {
      ...itemData,
      id: itemId, 
      quantity: 1, // Always add one unit at a time by default
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

