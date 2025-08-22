
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useProduct } from './ProductContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isLoadingCart: boolean;
  cartError: Error | string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
  const [cartError, setCartError] = useState<Error | string | null>(null);
  const { products } = useProduct();

  // Assuming cart is client-side until checkout, no initial fetch needed.
  // If cart were server-persistent, a useEffect with fetchCart() would go here.

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartError(null);
    try {
      if (product.stock < quantity) {
        console.warn(`Cannot add ${quantity} of product ${product.id}. Insufficient stock.`);
        return;
      }

      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          return [...prevItems, { ...product, quantity: quantity }];
        }
      });
    } catch (error) {
      console.error("Failed to add item to cart", error);
      setCartError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const removeFromCart = (productId: number) => {
    setCartError(null);
    try {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Failed to remove item from cart", error);
      setCartError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartError(null);
    try {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Failed to update cart item quantity", error);
      setCartError(error instanceof Error ? error : new Error(String(error)));
    }
  };
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, isLoadingCart, cartError }}>
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
