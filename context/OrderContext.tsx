
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
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}?userId=${currentUser.id}`);
      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data);
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
       const response = await fetch(API_BASE_URL, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(orderData),
       });

       if (!response.ok) {
         throw new Error(`Error adding order: ${response.statusText}`);
       }

       const newOrder = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if required
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error updating order status: ${response.statusText}`);
      }

      const updatedOrder = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
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
