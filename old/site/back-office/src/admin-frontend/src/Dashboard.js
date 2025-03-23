import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tableau de Bord</h1>
      <p>Bienvenue dans votre espace sécurisé.</p>
      <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
        Se déconnecter
      </button>
    </div>
  );
}

export default Dashboard;
