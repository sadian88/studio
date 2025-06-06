
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string; 
  shirtType: { id: string; name: string; imgSrc: string };
  color: { id: string; name: string; hex: string };
  design: { id: string; name: string; imgSrc: string; hint?: string }; 
  size?: { id: string; name: string }; // Added size
  quantity: number;
  price: number; 
  aiPrompt?: string; 
}

// Input type for adding to cart, ensuring all necessary fields are there before ID and quantity are assigned.
export type AddToCartItemInput = Omit<CartItem, 'id' | 'quantity'>;


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: AddToCartItemInput) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.findIndex(item => item.id === action.payload.id);

      if (existingItemIndex > -1) {
        return state.map((item, index) =>
          index === existingItemIndex
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

  const addToCart = useCallback((itemData: AddToCartItemInput) => {
    let finalItemId: string;
    const baseId = `${itemData.shirtType.id}-${itemData.color.id}`;
    const sizeIdPart = itemData.size ? `-${itemData.size.id}` : '';
    
    if (itemData.design.id.startsWith('ai-generated') && itemData.aiPrompt) {
      const promptSnippet = itemData.aiPrompt.substring(0,15).replace(/\s/g, '');
      finalItemId = `${baseId}${sizeIdPart}-${itemData.design.id}-${promptSnippet}`;
    } else {
      finalItemId = `${baseId}${sizeIdPart}-${itemData.design.id}`;
    }
    
    const newItem: CartItem = {
      ...itemData,
      id: finalItemId, 
      quantity: 1, 
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

    