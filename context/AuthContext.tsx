
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, LoginResponse } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<User | null>;
  isLoadingAuth: boolean;
  authError: Error | string | null;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'admin@wafi.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Wafi',
    role: 'admin'
  }
];

// Get users from localStorage or use mock data
const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      setAuthError(null);
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          setCurrentUser(null);
          setIsLoadingAuth(false);
          return;
        }
        
        const userData: User = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Authentication check error:", error);
        setAuthError(error instanceof Error ? error : new Error(String(error)));
        setCurrentUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getStoredUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      setIsLoadingAuth(false);
      return user;

    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error instanceof Error ? error : new Error(String(error)));
      setIsLoadingAuth(false);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setIsLoadingAuth(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role'>): Promise<User | null> => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getStoredUsers();
      
      // Check if user already exists
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      const newId = Math.max(...users.map(u => u.id)) + 1;
      const newUser: User = {
        ...userData,
        id: newId,
        role: 'customer'
      };
      
      users.push(newUser);
      saveUsers(users);
      
      // Auto-login after registration
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setIsLoadingAuth(false);
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError(error instanceof Error ? error : new Error(String(error)));
      setIsLoadingAuth(false);
      return null;
    }
  };


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, isLoadingAuth, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
