
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Order } from '../types';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_KEY = 'belleza-orders';

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const storedOrders = localStorage.getItem(ORDERS_KEY);
      return storedOrders ? JSON.parse(storedOrders) : [];
    } catch (error) {
        console.error("Failed to load orders from local storage, starting fresh.", error);
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
        console.error("Failed to save orders to local storage", error);
    }
  }, [orders]);

  const addOrder = (orderData: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
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
