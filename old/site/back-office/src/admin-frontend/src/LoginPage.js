import React, { useState } from 'react';
import axios from 'axios';

// const dotenv = require('dotenv');

// dotenv.config();


const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.token);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Connexion</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Se connecter</button>
      </form>
    </div>
  );
}

export default LoginPage;
