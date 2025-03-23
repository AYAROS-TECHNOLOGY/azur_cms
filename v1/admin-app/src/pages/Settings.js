import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    favicon: '',
    logo: '',
    smtp: {
      host: '',
      port: 587,
      secure: false,
      user: '',
      pass: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  // Charger les paramètres
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/settings');
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast.error('Impossible de charger les paramètres');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Gérer les changements de champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gérer les changements de champ booléen
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: checked
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  // Enregistrer les paramètres
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.put('/settings', settings);
      
      if (response.data.success) {
        toast.success('Paramètres enregistrés avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des paramètres:', error);
      toast.error('Impossible d\'enregistrer les paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Tester la configuration SMTP
  const testSmtpConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.put('/settings/smtp', settings.smtp);
      
      if (response.data.success) {
        if (response.data.warning) {
          toast.warning(response.data.warning);
        } else {
          toast.success(response.data.message || 'Configuration SMTP validée');
        }
      }
    } catch (error) {
      console.error('Erreur lors du test SMTP:', error);
      toast.error('Le test de connexion SMTP a échoué');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.siteTitle) {
    return <div className="flex justify-center items-center h-full">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres du site</h1>
        <button 
          onClick={handleSubmit} 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Informations générales */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du site
              </label>
              <input
                type="text"
                name="siteTitle"
                value={settings.siteTitle || ''}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="siteDescription"
                value={settings.siteDescription || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du Favicon
              </label>
              <input
                type="text"
                name="favicon"
                value={settings.favicon || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="/uploads/favicon.ico"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du Logo
              </label>
              <input
                type="text"
                name="logo"
                value={settings.logo || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="/uploads/logo.png"
              />
            </div>
          </div>
        </div>
        
        {/* Réseaux sociaux */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Réseaux sociaux</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                name="socialMedia.facebook"
                value={settings.socialMedia?.facebook || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="https://facebook.com/votreprofil"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                type="url"
                name="socialMedia.twitter"
                value={settings.socialMedia?.twitter || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="https://twitter.com/votreprofil"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                name="socialMedia.instagram"
                value={settings.socialMedia?.instagram || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="https://instagram.com/votreprofil"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                name="socialMedia.linkedin"
                value={settings.socialMedia?.linkedin || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="https://linkedin.com/company/votreentreprise"
              />
            </div>
          </div>
        </div>
        
        {/* Configuration SMTP */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Configuration SMTP</h2>
            <button
              type="button"
              onClick={testSmtpConnection}
              className="btn btn-outline text-sm"
              disabled={loading}
            >
              Tester la connexion
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hôte SMTP
              </label>
              <input
                type="text"
                name="smtp.host"
                value={settings.smtp?.host || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="smtp.example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="number"
                name="smtp.port"
                value={settings.smtp?.port || 587}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smtp.secure"
                  checked={settings.smtp?.secure || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 rounded mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Connexion sécurisée (SSL/TLS)
                </span>
              </label>
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    name="smtp.user"
                    value={settings.smtp?.user || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="smtp.pass"
                    value={settings.smtp?.pass || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;