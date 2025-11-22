import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { handleLogout } from './axiosInstance';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number; // Add this
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');

        console.log('Initializing auth with token:', token ? 'exists' : 'none');
        console.log('Initializing auth with userInfo:', userInfo ? 'exists' : 'none');

        if (token && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          console.log('Parsed user:', parsedUser);
          
          // Check if this is the old dummy data (test@example.com)
          if (parsedUser.email === 'test@example.com') {
            console.log('Detected old dummy data, clearing...');
            handleLogout();
            setUser(null);
          } else {
            // Valid user data
            setUser(parsedUser);
          }
        } else {
          console.log('No valid auth data found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        handleLogout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User) => {
    console.log('Login called with userData:', userData);
    setUser(userData);
  };

  const logout = () => {
    console.log("Logout called - clearing user state");

    // Clear AuthContext user
    setUser(null);

    console.log("Logout called - clearing localStorage");
    handleLogout(); // this clears all tokens + saved userInfo

    console.log("Logout completed, redirecting...");

    // Redirect user to login page
    window.location.href = "/login";
  };


  const clearAuth = () => {
    console.log('Clear auth called - clearing user state');
    setUser(null);
    console.log('Clear auth called - clearing localStorage');
    handleLogout();
    console.log('Clear auth completed');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    clearAuth,
  };

  

  console.log('AuthContext state:', { user, isAuthenticated: !!user, isLoading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 