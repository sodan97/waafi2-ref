
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useProduct } from './ProductContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
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

  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsLoadingCart(true);
    // Clear previous error if any
    setCartError(null);

    setCartError(null);
    try {
      // Ideally, you would call a backend API here to add the item to the cart,
      // which would also handle stock checks on the server side.
      // Example: const response = await fetch('/api/cart/add', { method: 'POST', ... });
      // For now, we'll update the local state and assume stock check is done elsewhere or not critical here.

      // Check product existence and stock locally for immediate feedback (optional, backend is source of truth)
      const productToAdd = products.find(p => p.id === productId);
      if (!productToAdd) {
        throw new Error("Product not found.");
      }
      if (productToAdd.stock < quantity) {
         // Handle insufficient stock error - maybe show a notification
         console.warn(`Cannot add ${quantity} of product ${productId}. Insufficient stock.`);
         setIsLoadingCart(false);
         // Optionally set a specific error state related to stock
         return;
      }

      // Update local state immediately (optimistic update) or after successful API call
      // For simplicity, updating locally after basic checks.
      // In a real app with persistent cart, update state based on API response.
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === productId);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          return [...prevItems, { ...productToAdd, quantity: quantity }];
        }
      });
      // Si le stock est à 0, on ne fait rien.
    setIsLoadingCart(false);
    } catch (error) {
        console.error("Failed to add item to cart", error);
        setCartError(error instanceof Error ? error : new Error(String(error)));
        setIsLoadingCart(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const removeFromCart = async (productId: number) => {
    setIsLoadingCart(true);
    setCartError(null);
    try {
      // If cart is persistent, call backend API to remove item
      // await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });

      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      setIsLoadingCart(false);
    } catch (error) {
      console.error("Failed to remove item from cart", error);
      setCartError(error instanceof Error ? error : new Error(String(error)));
      setIsLoadingCart(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setIsLoadingCart(true);
    setCartError(null);
    try {
        // If cart is persistent, call backend API to update quantity
        // await fetch(`/api/cart/update/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }), ... });

        // Update local state
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
        setIsLoadingCart(false);
    } catch (error) {
        console.error("Failed to update cart item quantity", error);
        setCartError(error instanceof Error ? error : new Error(String(error)));
        setIsLoadingCart(false);
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
