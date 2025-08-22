
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Reservation } from '../types';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides the current user ID

interface ReservationContextType {
  reservations: Reservation[];
  isLoadingReservations: boolean;
  reservationError: Error | string | null;
  addReservation: (productId: number, userId: number) => void;
  hasUserReserved: (productId: number, userId: number) => boolean;
  getReservationsByProduct: (productId: number) => Reservation[];
  removeReservationsForProduct: (productId: number) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const RESERVATIONS_KEY = 'reservations';

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const storedReservations = localStorage.getItem(RESERVATIONS_KEY);
      return storedReservations ? JSON.parse(storedReservations) : [];
    } catch (error) {
      console.error("Failed to load reservations from local storage.", error);
      return [];
    }
  });

  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reservationError, setReservationError] = useState<Error | string | null>(null);

  // Save to localStorage whenever reservations change
  useEffect(() => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (productId: number, userId: number) => {
    setReservationError(null);
    try {
      // Check if reservation already exists
      if (hasUserReserved(productId, userId)) {
        return;
      }
      
      const newReservation: Reservation = {
        productId,
        userId,
        date: new Date().toISOString(),
      };
      setReservations(prev => [...prev, newReservation]);
    } catch (error: any) {
      setReservationError(error);
      console.error("Error adding reservation:", error);
    }
  };

  const hasUserReserved = (productId: number, userId: number): boolean => {
    return reservations.some(res => res.productId === productId && res.userId === userId);
  };
    
  const getReservationsByProduct = (productId: number): Reservation[] => {
    return reservations.filter(res => res.productId === productId);
  };

  const removeReservationsForProduct = (productId: number) => {
    setReservationError(null);
    try {
      setReservations(prev => prev.filter(res => res.productId !== productId));
    } catch (error: any) {
      setReservationError(error);
      console.error("Error removing reservations for product:", error);
    }
  };

  const value = { 
    reservations,
    isLoadingReservations,
    reservationError,
    addReservation,
    hasUserReserved,
    getReservationsByProduct,
    removeReservationsForProduct,
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
