import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter' | 'admin';
  avatar?: string;
  companyName?: string; // For recruiters
  jobTitle?: string; // For recruiters
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'candidate' | 'recruiter') => Promise<boolean>;
  register: (email: string, password: string, name: string, userType: 'candidate' | 'recruiter', companyInfo?: { companyName: string; jobTitle: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string, userType: 'candidate' | 'recruiter'): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      const userData = response.user;
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        ...(userData.role === 'recruiter' && {
          companyName: userData.companyName,
          jobTitle: userData.jobTitle
        })
      });
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    userType: 'candidate' | 'recruiter',
    companyInfo?: { companyName: string; jobTitle: string }
  ): Promise<boolean> => {
    try {
      const response = await authService.register({
        email,
        password,
        name,
        userType,
        companyInfo
      });
      
      const userData = response.user;
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        ...(userData.role === 'recruiter' && {
          companyName: userData.companyName,
          jobTitle: userData.jobTitle
        })
      });
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.token);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Vérifier s'il y a un utilisateur stocké au chargement
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
