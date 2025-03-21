import React, { useState, useEffect, useContext, createContext } from 'react';

// Create the Auth context
const AuthContext = createContext(null);

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Validate token by parsing it (in a real app, you'd verify with backend)
          const userData = JSON.parse(atob(token.split('.')[1]));
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Clear invalid token
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      // In development, we'll use a mock login
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        // Create a simple mock token
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.8tat9ElH1rLdj8rjX4nFJP5x9y17djLYtVJgTyjJGNE';
        
        // Store token in localStorage
        localStorage.setItem('auth_token', mockToken);
        
        // Set user data
        const userData = { username: 'admin', role: 'admin' };
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { success: false, message: 'Identifiants invalides' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Auth context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};