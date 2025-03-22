import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Page de connexion améliorée avec meilleure gestion des erreurs
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  
  const { login, authError, isAuthenticated, validateToken } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Vérification de débogage de localStorage
    const checkLocalStorage = () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        const token = localStorage.getItem('token');
        
        setDebugInfo({
          hasAuthToken: !!authToken,
          hasToken: !!token,
          authTokenValid: authToken ? validateToken(authToken) : false,
          tokenValid: token ? validateToken(token) : false,
          localStorage: { ...localStorage }
        });
      } catch (error) {
        console.error('Error checking localStorage:', error);
        setDebugInfo({ error: error.message });
      }
    };
    
    checkLocalStorage();
  }, [isAuthenticated, navigate, validateToken]);
  
  // Afficher l'erreur d'authentification si elle existe
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login({ username, password });
      
      // Vérifier le localStorage après la connexion (pour débogage)
      const authToken = localStorage.getItem('auth_token');
      const token = localStorage.getItem('token');
      console.log('Après connexion:', { authToken: !!authToken, token: !!token });
      
      if (!result.success) {
        setError(result.message || 'Erreur de connexion');
        return;
      }
      
      // Redirection vers le tableau de bord
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Une erreur s\'est produite lors de la connexion');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleDebugToggle = () => {
    setShowDebug(!showDebug);
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(to bottom, rgba(10, 75, 68, 0.9), rgba(10, 75, 68, 0.8)), url("https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h4"
              fontFamily="'Cormorant Garamond', serif"
              color="primary"
              gutterBottom
            >
              Ayurveda Équilibre
            </Typography>
            <Typography variant="h5" gutterBottom>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous pour accéder au CMS
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nom d'utilisateur"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            
            {/* Informations de débogage (à supprimer en production) */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                CMS développé sur mesure pour Ayurveda Équilibre
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="text" 
                  color="inherit" 
                  size="small" 
                  onClick={handleDebugToggle}
                  sx={{ opacity: 0.5 }}
                >
                  {showDebug ? 'Masquer infos debug' : 'Afficher infos debug'}
                </Button>
              </Box>
              
              {showDebug && debugInfo && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;