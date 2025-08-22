
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, LoginResponse } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<User | null>;
  isLoadingAuth: boolean;
  authError: Error | string | null;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      setAuthError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCurrentUser(null);
          setIsLoadingAuth(false);
          return;
        }
        
        // Decode token to get user info
        try {
          const decoded: any = jwtDecode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setCurrentUser(null);
            setIsLoadingAuth(false);
            return;
          }
          
          // Get user details from backend
          const response = await fetch(`/api/users/${decoded.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            localStorage.removeItem('token');
            setCurrentUser(null);
            throw new Error('Authentication check failed');
          }
          
          const userData: User = await response.json();
          setCurrentUser(userData);
        } catch (tokenError) {
          console.error('Token decode error:', tokenError);
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
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
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      localStorage.setItem('token', data.token);
      
      // Decode token to get user info
      const decoded: any = jwtDecode(data.token);
      const userResponse = await fetch(`/api/users/${decoded.id}`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });
      
      if (userResponse.ok) {
        const userData: User = await userResponse.json();
        setCurrentUser(userData);
      }
      
      setIsLoadingAuth(false);
      return currentUser;

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
      // Ideally, you would call a backend API here to invalidate the token
      // const response = await fetch('/api/users/logout', { method: 'POST', ... });
      // if (!response.ok) {
      //    console.error('Backend logout failed');
      // }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if backend logout fails, clear client state
      setAuthError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsLoadingAuth(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role'>): Promise<User | null> => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const newUser: User = await response.json(); // Assuming backend returns the new user object
      // Optionally log in the new user automatically
      // localStorage.setItem('token', newToken); // if backend returns a token
      
      // Auto-login after registration
      const loginResult = await login(userData.email, userData.password);
      setIsLoadingAuth(false);
      return loginResult;
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
