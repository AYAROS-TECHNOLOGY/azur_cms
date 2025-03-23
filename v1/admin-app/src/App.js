import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PagesList from './pages/PagesList';
import PageEditor from './pages/PageEditor';
import MediaLibrary from './pages/MediaLibrary';
import ThemeEditor from './pages/ThemeEditor';
import Settings from './pages/Settings';
import Deploy from './pages/Deploy';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';

const App = () => {
  // Configurer Axios
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  return (
    <AuthProvider>
      <Routes>
        {/* Routes d'authentification */}
        <Route path="/login" element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        } />
        
        {/* Routes protégées */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pages" element={<PagesList />} />
          <Route path="pages/new" element={<PageEditor />} />
          <Route path="pages/:id" element={<PageEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="themes" element={<ThemeEditor />} />
          <Route path="settings" element={<Settings />} />
          <Route path="deploy" element={<Deploy />} />
          <Route path="users" element={<Users />} />
        </Route>
        
        {/* Route 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Configuration globale des toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
};

export default App;