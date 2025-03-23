import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white border-r shadow-sm ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          {isSidebarOpen ? (
            <Link to="/" className="text-xl font-bold text-blue-600">MiniCMS</Link>
          ) : (
            <Link to="/" className="text-xl font-bold text-blue-600">M</Link>
          )}
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            <i className={`fas fa-${isSidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className={`flex items-center px-4 py-3 ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-tachometer-alt w-5"></i>
                {isSidebarOpen && <span className="ml-3">Tableau de bord</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/pages" 
                className={`flex items-center px-4 py-3 ${isActive('/pages') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-file w-5"></i>
                {isSidebarOpen && <span className="ml-3">Pages</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/media" 
                className={`flex items-center px-4 py-3 ${isActive('/media') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-images w-5"></i>
                {isSidebarOpen && <span className="ml-3">Médias</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/themes" 
                className={`flex items-center px-4 py-3 ${isActive('/themes') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-paint-brush w-5"></i>
                {isSidebarOpen && <span className="ml-3">Thèmes</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={`flex items-center px-4 py-3 ${isActive('/settings') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-cog w-5"></i>
                {isSidebarOpen && <span className="ml-3">Paramètres</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/deploy" 
                className={`flex items-center px-4 py-3 ${isActive('/deploy') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-rocket w-5"></i>
                {isSidebarOpen && <span className="ml-3">Déploiement</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/users" 
                className={`flex items-center px-4 py-3 ${isActive('/users') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <i className="fas fa-users w-5"></i>
                {isSidebarOpen && <span className="ml-3">Utilisateurs</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-700">
            {location.pathname === '/' && 'Tableau de bord'}
            {location.pathname === '/pages' && 'Pages'}
            {location.pathname.startsWith('/pages/') && 'Éditeur de page'}
            {location.pathname === '/media' && 'Bibliothèque de médias'}
            {location.pathname === '/themes' && 'Éditeur de thème'}
            {location.pathname === '/settings' && 'Paramètres'}
            {location.pathname === '/deploy' && 'Déploiement'}
            {location.pathname === '/users' && 'Utilisateurs'}
          </h1>
          
          {/* User menu */}
          <div className="relative">
            <button className="flex items-center text-gray-700 hover:text-gray-900">
              <span className="mr-2">Admin</span>
              <i className="fas fa-user-circle text-xl"></i>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;