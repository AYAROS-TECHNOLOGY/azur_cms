import React, { useState, useEffect, useContext, createContext } from 'react';
import api from '../services/api';

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
  const [authError, setAuthError] = useState(null);

  // Vérification d'authentification améliorée
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Priorité au token principal (si les deux existent)
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        if (token) {
          console.log('Token trouvé lors de l\'initialisation');
          
          try {
            // Valider le token en le décodant
            const payload = token.split('.')[1];
            const userData = JSON.parse(atob(payload));
            
            if (userData) {
              console.log('Token décodé avec succès', userData);
              
              // Stockage cohérent - utiliser un seul emplacement pour le token
              localStorage.setItem('auth_token', token);
              if (localStorage.getItem('token') !== token) {
                localStorage.setItem('token', token);
              }
              
              setUser(userData);
              setIsAuthenticated(true);
              setAuthError(null);
            } else {
              console.error('Données utilisateur invalides dans le token');
              handleInvalidToken();
            }
          } catch (decodeError) {
            console.error('Erreur de décodage du token:', decodeError);
            handleInvalidToken();
          }
        } else {
          console.log('Aucun token trouvé');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        handleInvalidToken();
      } finally {
        setLoading(false);
      }
    };

    const handleInvalidToken = () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setAuthError('Session expirée ou invalide');
    };

    checkAuth();
  }, []);

  // Login function with improved token management
  const login = async (credentials) => {
    try {
      setAuthError(null);
      
      // Option 1: Utiliser une API de connexion réelle
      /*
      const response = await api.post('/auth/login', credentials);
      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      */
      
      // Option 2: Mode développement (mock)
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.8tat9ElH1rLdj8rjX4nFJP5x9y17djLYtVJgTyjJGNE';
        
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('token', mockToken);
        
        const userData = { username: 'admin', role: 'admin' };
        setUser(userData);
        setIsAuthenticated(true);
        
        // Vérifier que le token a bien été stocké
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token stocké avec succès:', !!storedToken);
        
        return { success: true };
      }
      
      setAuthError('Identifiants invalides');
      return { success: false, message: 'Identifiants invalides' };
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Erreur de connexion, veuillez réessayer');
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };
  
  // Test de validation du token
  const validateToken = () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;
      
      // Validation simple: le token est-il au format JWT (xxx.yyy.zzz)
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error) {
      console.error('Erreur de validation de token:', error);
      return false;
    }
  };

  // Auth context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    authError,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};