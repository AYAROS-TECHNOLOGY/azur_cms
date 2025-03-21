// client/src/contexts/AlertContext.jsx
import React, { useState, useContext, createContext } from 'react';

// Create the Alert context
const AlertContext = createContext(null);

// Custom hook to use the Alert context
export const useAlert = () => {
  return useContext(AlertContext);
};

// Alert provider component
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'info' // 'info', 'success', 'warning', 'error'
  });

  // Show success alert
  const showSuccess = (message) => {
    setAlert({
      show: true,
      message,
      type: 'success'
    });
  };

  // Show error alert
  const showError = (message) => {
    setAlert({
      show: true,
      message,
      type: 'error'
    });
  };

  // Show info alert
  const showInfo = (message) => {
    setAlert({
      show: true,
      message,
      type: 'info'
    });
  };

  // Show warning alert
  const showWarning = (message) => {
    setAlert({
      show: true,
      message,
      type: 'warning'
    });
  };

  // Close alert
  const closeAlert = () => {
    setAlert(prev => ({
      ...prev,
      show: false
    }));
  };

  // Alert context value
  const value = {
    alert,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};