
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Reservation } from '../types';

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (productId: number, userId: number) => void;
  hasUserReserved: (productId: number, userId: number) => boolean;
  getReservationsByProduct: (productId: number) => Reservation[];
  removeReservationsForProduct: (productId: number) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const RESERVATIONS_KEY = 'belleza-reservations';

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const storedReservations = localStorage.getItem(RESERVATIONS_KEY);
      return storedReservations ? JSON.parse(storedReservations) : [];
    } catch (error) {
      console.error("Failed to load reservations from local storage.", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (productId: number, userId: number) => {
    setReservations(prev => {
      const alreadyExists = prev.some(res => res.productId === productId && res.userId === userId);
      if (alreadyExists) return prev;
      
      const newReservation: Reservation = {
        productId,
        userId,
        date: new Date().toISOString(),
      };
      return [...prev, newReservation];
    });
  };

  const hasUserReserved = (productId: number, userId: number): boolean => {
    return reservations.some(res => res.productId === productId && res.userId === userId);
  };
    
  const getReservationsByProduct = (productId: number): Reservation[] => {
    return reservations.filter(res => res.productId === productId);
  };

  const removeReservationsForProduct = (productId: number) => {
    setReservations(prev => prev.filter(res => res.productId !== productId));
  };

  const value = { 
    reservations, 
    addReservation, 
    hasUserReserved, 
    getReservationsByProduct, 
    removeReservationsForProduct 
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
