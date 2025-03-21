// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';

// Contextes
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider, useAlert } from './contexts/AlertContext';

// Pages
import Login from '././pages/Login';
import Dashboard from '././pages/Dashboard';
import PageEditor from '././pages/PageEditor';
import PagesList from '././pages/PagesList';
import MediaManager from '././pages/MediaManager';
import ThemeEditor from '././pages/ThemeEditor';
// import Settings from '././pages/Settings';
// import NotFound from '././pages/NotFound';

// Composants
import Layout from './components/layout/Layout';

// Services
import { getSiteTheme } from './services/api';

const App = () => {
  return (
    <ThemeProvider theme={createTheme({
      palette: {
        primary: {
          main: '#0a4b44',
        },
        secondary: {
          main: '#d4a039',
        },
        background: {
          default: '#f9f5f0',
        },
      },
      typography: {
        fontFamily: "'Montserrat', sans-serif",
        h1: {
          fontFamily: "'Cormorant Garamond', serif",
        },
        h2: {
          fontFamily: "'Cormorant Garamond', serif",
        },
        h3: {
          fontFamily: "'Cormorant Garamond', serif",
        },
        h4: {
          fontFamily: "'Cormorant Garamond', serif",
        },
        h5: {
          fontFamily: "'Cormorant Garamond', serif",
        },
        h6: {
          fontFamily: "'Cormorant Garamond', serif",
        },
      },
    })}>
      <CssBaseline />
      <AuthProvider>
        <AlertProvider>
          <Router>
            <AppContent />
          </Router>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const { alert, closeAlert } = useAlert();
  const [dynamicTheme, setDynamicTheme] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSiteTheme();
    }
  }, [isAuthenticated]);

  const loadSiteTheme = async () => {
    try {
      const themeData = await getSiteTheme();
      if (themeData) {
        setDynamicTheme(createTheme({
          palette: {
            primary: {
              main: themeData.colors.primary,
            },
            secondary: {
              main: themeData.colors.accent,
            },
            background: {
              default: themeData.colors.light,
            },
            text: {
              primary: themeData.colors.dark,
            },
          },
          typography: {
            fontFamily: themeData.fonts.body,
            h1: {
              fontFamily: themeData.fonts.heading,
            },
            h2: {
              fontFamily: themeData.fonts.heading,
            },
            h3: {
              fontFamily: themeData.fonts.heading,
            },
            h4: {
              fontFamily: themeData.fonts.heading,
            },
            h5: {
              fontFamily: themeData.fonts.heading,
            },
            h6: {
              fontFamily: themeData.fonts.heading,
            },
          },
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="pages" element={<PagesList />} />
          <Route path="pages/new" element={<PageEditor />} />
          <Route path="pages/:pageId" element={<PageEditor />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="theme" element={<ThemeEditor />} />
          {/* <Route path="settings" element={<Settings />} /> */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Routes>

      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeAlert} 
          severity={alert.type} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default App;