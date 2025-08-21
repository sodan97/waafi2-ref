
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, LoginResponse } from '../types'; // Assuming LoginResponse includes token and user info
import {jwtDecode} from 'jwt-decode'; // Assuming jwt-decode is installed for decoding tokens

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>; // login is now async and returns a User
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<boolean>; // register is now async and returns a boolean
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USERS_KEY = 'belleza-users';
const CURRENT_USER_KEY = 'belleza-currentUser';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      let loadedUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      // Ensure admin user exists
      const adminExists = loadedUsers.some(u => u.role === 'admin');
      if (!adminExists) {
        const adminUser: User = {
          id: Date.now(),
          email: 'admin@wafi.com',
          password: 'admin', // In a real app, use a hashed password
          firstName: 'Admin',
          lastName: 'WAFI',
          role: 'admin',
        };
        loadedUsers.push(adminUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(loadedUsers));
      }
      setUsers(loadedUsers);

      const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    } catch (error) {
      console.error("Failed to load user data from local storage", error);
    }
  }, []);
  
  const login = (email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const register = (userData: Omit<User, 'id' | 'role'>): boolean => {
    const userExists = users.some(u => u.email === userData.email);
    if (userExists) {
      return false; // User already exists
    }
    const newUser: User = {
      ...userData,
      id: Date.now(),
      role: 'customer',
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    // Automatically log in the new user
    setCurrentUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, register }}>
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
