import axios from 'axios';
import { 
  mockSiteStructure, 
  mockPages, 
  mockMediaFiles, 
  mockTheme, 
  mockVersions 
} from '../utils/mockData';

// API base URL (use environment variable or fallback to local server)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Flag to use mock data (set to true if you're having server issues)
const USE_MOCK_DATA = true;

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
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Authentication APIs
export const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store token directly here as well to ensure it's available immediately
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  };
// Site structure APIs
export const getSiteStructure = async () => {
    if (USE_MOCK_DATA) {
      console.log('Using mock site structure data');
      return mockSiteStructure;
    }
    
    try {
      const response = await api.get('/site-structure');
      return response.data;
    } catch (error) {
      console.error('Error fetching site structure:', error);
      // Fall back to mock data on error
      console.log('Falling back to mock site structure data');
      return mockSiteStructure;
    }
  };
  
  export const updateSiteStructure = async (structure) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Updated site structure', structure);
      return { message: 'Structure mise à jour avec succès' };
    }
    
    try {
      const response = await api.put('/site-structure', structure);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la structure du site' };
    }
  };
  
  // Page APIs
  export const getPage = async (pageId) => {
    if (USE_MOCK_DATA) {
      console.log(`Using mock page data for: ${pageId}`);
      return mockPages[pageId] || {
        title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
        meta: {
          description: "",
          keywords: ""
        },
        sections: [
          {
            id: "header",
            type: "header",
            className: "header",
            content: []
          },
          {
            id: "main-content",
            type: "section",
            className: "main-content",
            content: []
          },
          {
            id: "footer",
            type: "footer",
            className: "footer",
            content: []
          }
        ]
      };
    }
    
    try {
      const response = await api.get(`/pages/${pageId}`);
      return response.data;
    } catch (error) {
      if (USE_MOCK_DATA) {
        // Fall back to mock data on error
        console.log(`Falling back to mock page data for: ${pageId}`);
        return mockPages[pageId] || {
          title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
          meta: { description: "", keywords: "" },
          sections: []
        };
      }
      throw error.response?.data || { message: 'Erreur lors de la récupération de la page' };
    }
  };
  
  export const createPage = async (pageData) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Created page', pageData);
      return { message: 'Page créée avec succès', pageId: pageData.pageId };
    }
    
    try {
      const response = await api.post('/pages', pageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la page' };
    }
  };
  
  export const updatePage = async (pageId, pageData) => {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Updated page ${pageId}`, pageData);
      return { message: 'Page mise à jour avec succès' };
    }
    
    try {
      const response = await api.put(`/pages/${pageId}`, pageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la page' };
    }
  };
  
  export const deletePage = async (pageId) => {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Deleted page ${pageId}`);
      return { message: 'Page supprimée avec succès' };
    }
    
    try {
      const response = await api.delete(`/pages/${pageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la page' };
    }
  };
  
  // Media APIs
  export const getMediaList = async () => {
    if (USE_MOCK_DATA) {
      console.log('Using mock media data');
      return mockMediaFiles;
    }
    
    try {
      const response = await api.get('/media');
      return response.data;
    } catch (error) {
      console.error('Error fetching media:', error);
      // Fall back to mock data on error
      console.log('Falling back to mock media data');
      return mockMediaFiles;
    }
  };
  
  export const uploadMedia = async (file, folder = 'images') => {
    if (USE_MOCK_DATA) {
      // Generate a mock response with a placeholder URL
      const mockResponse = {
        filename: `${folder}/${file.name}`,
        url: URL.createObjectURL(file)
      };
      console.log('Mock: Uploaded file', mockResponse);
      return mockResponse;
    }
    
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
      throw error.response?.data || { message: 'Erreur lors de l\'upload du fichier' };
    }
  };
  
  export const deleteMedia = async (filename) => {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Deleted media ${filename}`);
      return { message: 'Fichier supprimé avec succès' };
    }
    
    try {
      const response = await api.delete(`/media/${encodeURIComponent(filename)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du fichier' };
    }
  };
  
  // Theme APIs
  export const getSiteTheme = async () => {
    if (USE_MOCK_DATA) {
      console.log('Using mock theme data');
      return mockTheme;
    }
    
    try {
      const response = await api.get('/themes/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching theme:', error);
      // Fall back to mock data on error
      console.log('Falling back to mock theme data');
      return mockTheme;
    }
  };
  
  export const updateSiteTheme = async (theme) => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Updated theme', theme);
      return { message: 'Thème mis à jour avec succès' };
    }
    
    try {
      const response = await api.put('/themes/active', theme);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du thème' };
    }
  };
  
  export const createTheme = async (id, theme) => {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Created theme ${id}`, theme);
      return { message: 'Thème créé avec succès', id };
    }
    
    try {
      const response = await api.post('/themes', { id, theme });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du thème' };
    }
  };
  
  export const exportTheme = async (themeId) => {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Exported theme ${themeId}`);
      return { 
        message: 'Thème prêt pour l\'export',
        downloadUrl: '#',
        theme: mockTheme
      };
    }
    
    try {
      const response = await api.get(`/themes/${themeId}/export`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'export du thème' };
    }
  };
  
  // Version APIs
  export const getVersions = async () => {
    if (USE_MOCK_DATA) {
      console.log('Using mock versions data');
      return mockVersions;
    }
    
    try {
      const response = await api.get('/versions');
      return response.data;
    } catch (error) {
      console.error('Error fetching versions:', error);
      // Fall back to mock data on error
      console.log('Falling back to mock versions data');
      return mockVersions;
    }
  };
  
  export const restoreVersion = async (versionFile, targetFile) => {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Restored version ${versionFile} to ${targetFile}`);
      return { message: 'Version restaurée avec succès' };
    }
    
    try {
      const response = await api.post('/versions/restore', { versionFile, targetFile });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la restauration de la version' };
    }
  };
  
  // Publish API
  export const publishSite = async () => {
    if (USE_MOCK_DATA) {
      console.log('Mock: Published site');
      return { message: 'Site publié avec succès' };
    }
    
    try {
      const response = await api.post('/publish');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la publication du site' };
    }
  };

export default api;