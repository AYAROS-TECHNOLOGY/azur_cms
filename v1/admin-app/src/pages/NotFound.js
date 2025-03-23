import React, { useState } from 'react';

const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  // Style CSS intégré pour garantir l'affichage
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f7f9fc'
    },
    card: {
      maxWidth: '500px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      padding: '30px',
      textAlign: 'center'
    },
    errorCode: {
      fontSize: '100px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0',
      lineHeight: '1'
    },
    errorTag: {
      display: 'inline-block',
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      marginBottom: '20px'
    },
    title: {
      fontSize: '28px',
      color: '#1f2937',
      margin: '20px 0',
      fontWeight: 'bold'
    },
    message: {
      color: '#4b5563',
      fontSize: '16px',
      lineHeight: '1.5',
      marginBottom: '25px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      fontSize: '16px'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '2px solid #3b82f6',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      fontSize: '16px'
    },
    separator: {
      margin: '30px 0 25px',
      borderTop: '1px solid #e5e7eb',
      width: '100%'
    },
    searchContainer: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto'
    },
    searchLabel: {
      display: 'block',
      marginBottom: '15px',
      color: '#6b7280',
      fontSize: '14px'
    },
    searchInputContainer: {
      display: 'flex',
      position: 'relative'
    },
    searchInput: {
      flex: '1',
      padding: '12px 15px',
      borderRadius: '8px 0 0 8px',
      border: '2px solid #d1d5db',
      fontSize: '16px',
      outline: 'none'
    },
    searchButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0 20px',
      borderRadius: '0 8px 8px 0',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    notification: {
      marginTop: '20px',
      padding: '10px',
      backgroundColor: '#f0f9ff',
      color: '#3b82f6',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      fontSize: '14px',
      textAlign: 'center',
      display: message ? 'block' : 'none'
    }
  };

  // Effets hover
  const handleMouseOver = (e, isSecondary) => {
    if (isSecondary) {
      e.target.style.backgroundColor = '#eff6ff';
    } else {
      e.target.style.backgroundColor = '#2563eb';
    }
  };

  const handleMouseOut = (e, isSecondary) => {
    if (isSecondary) {
      e.target.style.backgroundColor = 'transparent';
    } else {
      e.target.style.backgroundColor = '#3b82f6';
    }
  };

  // Actions des boutons
  const goToHomepage = () => {
    setMessage('Redirection vers la page d\'accueil...');
    // Dans une vraie application, utilisez :
    window.location.href = '/';
    
    // Simulons une redirection après 2 secondes
    setTimeout(() => {
      setMessage('Vous seriez maintenant sur la page d\'accueil!');
    }, 2000);
  };

  const contactSupport = () => {
    setMessage('Ouverture de la page de contact...');
    
    // Simulons une redirection après 2 secondes
    setTimeout(() => {
      setMessage('Vous seriez maintenant sur la page de contact!');
    }, 2000);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setMessage('Veuillez entrer un terme de recherche');
    } else {
      setMessage(`Recherche en cours pour : "${searchQuery}"`);
      
      // Simulons une recherche après 2 secondes
      setTimeout(() => {
        setMessage(`Résultats pour "${searchQuery}" auraient été affichés ici`);
      }, 2000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.errorCode}>404</h1>
        <span style={styles.errorTag}>Erreur</span>
        
        <h2 style={styles.title}>Page non trouvée</h2>
        <p style={styles.message}>
          La page que vous recherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou retournez à l'accueil.
        </p>
        
        <div style={styles.buttonContainer}>
          <button 
            style={styles.primaryButton}
            onMouseOver={(e) => handleMouseOver(e, false)} 
            onMouseOut={(e) => handleMouseOut(e, false)}
            onClick={goToHomepage}
          >
            Retour à l'accueil
          </button>
          
          {/* <button 
            style={styles.secondaryButton}
            onMouseOver={(e) => handleMouseOver(e, true)} 
            onMouseOut={(e) => handleMouseOut(e, true)}
            onClick={contactSupport}
          >
            Contacter le support
          </button> */}
        </div>
        
        <div style={styles.separator}></div>
        
        <div style={styles.searchContainer}>
          <label style={styles.searchLabel}>
            Vous pouvez aussi essayer de rechercher :
          </label>
          <div style={styles.searchInputContainer}>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              style={styles.searchButton}
              onClick={handleSearch}
            >
              Rechercher
            </button>
          </div>
        </div>
        
        {message && <div style={styles.notification}>{message}</div>}
      </div>
    </div>
  );
};

export default NotFound;