import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'faculty' | 'admin') => Promise<void>;
  logout: () => void;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, role: 'student' | 'faculty' | 'admin') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on role
    const mockUsers = {
      student: {
        id: '1',
        name: 'John Doe',
        email: 'john@university.edu',
        role: 'student' as const,
        department: 'Computer Science'
      },
      faculty: {
        id: '2',
        name: 'Dr. Sarah Smith',
        email: 'sarah@university.edu',
        role: 'faculty' as const,
        department: 'Computer Science'
      },
      admin: {
        id: '3',
        name: 'Admin User',
        email: 'admin@university.edu',
        role: 'admin' as const,
        department: 'Administration'
      }
    };

    setUser(mockUsers[role]);
    localStorage.setItem('authToken', 'mock-jwt-token');
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};