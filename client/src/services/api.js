import axios from 'axios';

// API base URL (use environment variable or fallback to local server)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Désactivation des données fictives - essentiel pour passer en production
const USE_MOCK_DATA = false;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Vérifie tous les tokens possibles (en ordre de priorité)
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
    if (token) {
      // console.log('Token trouvé:', token);
      // Assure-toi que l'en-tête Authorization est correctement formaté
      config.headers.Authorization = `Bearer ${token.replace(/^Bearer\s+/i, '')}`;
      
      // Debug: Affiche le token utilisé dans la console (à supprimer en production)
      // console.log('Using token for request:', config.url);
    } else {
      console.warn('No authentication token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gère spécifiquement les erreurs 401 (Non autorisé)
    if (error.response && error.response.status === 401) {
      console.error('Authentication error (401):', error.response.data);
      
      // Log l'URL qui a échoué pour faciliter le débogage
      // console.error('Failed request URL:', error.config.url);
      
      // Option 1: Rediriger vers la page de connexion si nécessaire
      // window.location.href = '/login';
      
      // Option 2: Essayer de rafraîchir le token (si disponible)
      // refreshToken().then(...);
    }
    
    return Promise.reject(error);
  }
);


// Improve error handling across all API calls
const handleApiError = (error, fallback = null) => {
  console.error('API Error:', error);
  
  // If we have a response from the server
  if (error.response) {
    return Promise.reject(error.response.data || { message: 'Erreur serveur' });
  }
  
  // If the error is a network error
  if (error.request) {
    return Promise.reject({ message: 'Erreur de connexion, vérifiez votre réseau' });
  }
  
  // For other errors
  return Promise.reject({ message: error.message || 'Une erreur inconnue s\'est produite' });
};

// Authentication APIs
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // Store token directly here as well to ensure it's available immediately
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      console.log('Token stored:', response.data.token);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, { success: false, message: 'Identifiants invalides' });
  }
};

// Site structure APIs
export const getSiteStructure = async () => {
  try {
    const response = await api.get('/site-structure');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSiteStructure = async (structure) => {
  try {
    const response = await api.put('/site-structure', structure);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Page APIs
export const getPage = async (pageId) => {
  try {
    const response = await api.get(`/pages/${pageId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createPage = async (pageData) => {
  try {
    const response = await api.post('/pages', pageData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updatePage = async (pageId, pageData) => {
  try {
    const response = await api.put(`/pages/${pageId}`, pageData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deletePage = async (pageId) => {
  try {
    const response = await api.delete(`/pages/${pageId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Media APIs with improved file handling
export const getMediaList = async () => {
  try {
    const response = await api.get('/media');
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const uploadMedia = async (file, folder = 'images') => {
  try {
    // Convert file to base64
    const reader = new FileReader();
    const filePromise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    
    const fileContent = await filePromise;
    
    const response = await api.post('/media/upload', {
      filename: file.name,
      fileContent,
      contentType: file.type,
      folder
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteMedia = async (filename) => {
  try {
    const response = await api.delete(`/media/${encodeURIComponent(filename)}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Theme APIs
export const getSiteTheme = async () => {
  try {
    const response = await api.get('/themes/active');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSiteTheme = async (theme) => {
  try {
    const response = await api.put('/themes/active', theme);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTheme = async (id, theme) => {
  try {
    const response = await api.post('/themes', { id, theme });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const exportTheme = async (themeId) => {
  try {
    const response = await api.get(`/themes/${themeId}/export`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Version APIs
export const getVersions = async () => {
  try {
    const response = await api.get('/versions');
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const restoreVersion = async (versionFile, targetFile) => {
  try {
    const response = await api.post('/versions/restore', { versionFile, targetFile });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// SMTP Settings APIs
export const getSmtpSettings = async () => {
  try {
    const response = await api.get('/settings/smtp');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSmtpSettings = async (settings) => {
  try {
    const response = await api.put('/settings/smtp', settings);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Blog APIs (new)
export const getBlogPosts = async () => {
  try {
    const response = await api.get('/blog/posts');
    return response.data;
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const getBlogPost = async (postId) => {
  try {
    const response = await api.get(`/blog/posts/${postId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createBlogPost = async (postData) => {
  try {
    const response = await api.post('/blog/posts', postData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBlogPost = async (postId, postData) => {
  try {
    const response = await api.put(`/blog/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteBlogPost = async (postId) => {
  try {
    const response = await api.delete(`/blog/posts/${postId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Publish API
export const publishSite = async () => {
  try {
    const response = await api.post('/publish');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export default api;