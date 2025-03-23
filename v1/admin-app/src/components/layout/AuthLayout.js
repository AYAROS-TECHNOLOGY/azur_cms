import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  // Vérifier si l'utilisateur est déjà connecté
  const token = localStorage.getItem('token');
  
  // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;