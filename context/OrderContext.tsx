
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Order } from '../types';
import { useAuth } from './AuthContext'; // Assuming you need the current user for fetching orders

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Promise<Order | undefined>;
  isLoading: boolean;
  error: string | null;
  updateOrderStatus: (orderId: string, newStatus: string) => void;
  fetchOrders: () => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>; // Added deleteOrder
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Get currentUser from AuthContext

  const API_BASE_URL = '/api/orders'; // Base URL for your backend API

  useEffect(() => {
    // Fetch orders only if a user is logged in
    if (currentUser) {
      fetchOrders();
    } else {
      // Clear orders if user logs out
      setOrders([]);
    }
  }, [currentUser]); // Depend on currentUser

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const storedOrders = localStorage.getItem('orders');
      let allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Filter orders for current user if logged in
      if (currentUser) {
        allOrders = allOrders.filter(order => order.userId === currentUser.id.toString());
      }
      
      setOrders(allOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new order via backend API
  const addOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order | undefined> => {
     setIsLoading(true);
     setError(null);
     try {
       // Simulate API delay
       await new Promise(resolve => setTimeout(resolve, 500));
       
       const newOrder: Order = {
         ...orderData,
         id: Date.now().toString(),
         date: new Date().toISOString(),
         status: 'Pas commencé'
       };
       
       // Save to localStorage
       const storedOrders = localStorage.getItem('orders');
       const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
       allOrders.push(newOrder);
       localStorage.setItem('orders', JSON.stringify(allOrders));
       
       setOrders(prevOrders => [newOrder, ...prevOrders]);
       return newOrder;

     } catch (err: any) {
       setError(err.message || 'Failed to add order');
       console.error("Error adding order:", err);
       return undefined;
     } finally {
        setIsLoading(false);
     }
  };

 // Function to update order status via backend API
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update in localStorage
      const storedOrders = localStorage.getItem('orders');
      const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
      const updatedOrders = allOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      console.error("Error updating order status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
      // Implementation for deleting an order via API call
      console.log(`Deleting order ${orderId}`);
      // TODO: Implement actual DELETE request and state update logic
  };

  return (
    // Export isLoading and error here
    <OrderContext.Provider value={{ orders, addOrder, isLoading, error, updateOrderStatus, fetchOrders, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
