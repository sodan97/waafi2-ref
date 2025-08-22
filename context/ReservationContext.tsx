
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Reservation } from '../types';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides the current user ID

interface ReservationContextType {
  reservations: Reservation[];
  isLoadingReservations: boolean;
  reservationError: Error | string | null;
  addReservation: (productId: number) => Promise<void>;
  hasUserReserved: (productId: number, userId: number) => boolean;
  getReservationsByProduct: (productId: number) => Reservation[];
  cancelReservation: (productId: number) => Promise<void>; // Changed to cancel a specific reservation
  // Potentially add an admin function like removeReservationsForProduct if needed
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

  const { currentUser } = useAuth(); // Get the current user from AuthContext

  // Fetch reservations for the current user on mount
  useEffect(() => {
    const fetchReservations = async () => {
      if (!currentUser) return; // Only fetch if a user is logged in

      setIsLoadingReservations(true);
      setReservationError(null);
      try {
        // Assuming an API endpoint like /api/reservations?userId=...
        const response = await fetch(`/api/reservations?userId=${currentUser.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.statusText}`);
        }
        const data: Reservation[] = await response.json();
        setReservations(data);
      } catch (error: any) {
        setReservationError(error);
        console.error("Error fetching reservations:", error);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [currentUser?.id]); // Re-fetch if the currentUser changes

  const addReservation = async (productId: number) => {
    if (!currentUser) {
      setReservationError("User not logged in.");
      return;
    }

    setIsLoadingReservations(true);
    setReservationError(null);
    try {
      // Assuming an API endpoint like POST /api/reservations
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId: currentUser.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add reservation: ${errorData.message || response.statusText}`);
      }
      const newReservation: Reservation = await response.json(); // Assuming the backend returns the created reservation
      setReservations(prev => [...prev, newReservation]);
    } catch (error: any) {
      setReservationError(error);
      console.error("Error adding reservation:", error);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const hasUserReserved = (productId: number, userId: number): boolean => {
    return reservations.some(res => res.productId === productId && res.userId === userId);
  };
    
  const getReservationsByProduct = (productId: number): Reservation[] => {
    return reservations.filter(res => res.productId === productId);
  };

  // Changed to cancel a specific reservation by product ID and user ID
  const cancelReservation = async (productId: number) => {
     if (!currentUser) {
      setReservationError("User not logged in.");
      return;
    }

    setIsLoadingReservations(true);
    setReservationError(null);
    try {
      // Assuming an API endpoint like DELETE /api/reservations/:productId/:userId
      const response = await fetch(`/api/reservations/${productId}/${currentUser.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(`Failed to cancel reservation: ${errorData.message || response.statusText}`);
      }
      // Remove the reservation from the local state
      setReservations(prev => prev.filter(res => !(res.productId === productId && res.userId === currentUser.id)));
    } catch (error: any) {
      setReservationError(error);
      console.error("Error cancelling reservation:", error);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const value = { 
 reservations,
 isLoadingReservations,
    reservationError,
 addReservation,
 hasUserReserved,
 getReservationsByProduct,
 cancelReservation, // Export the new cancel function
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
