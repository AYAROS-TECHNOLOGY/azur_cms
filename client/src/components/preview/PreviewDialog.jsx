import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TabletIcon from '@mui/icons-material/Tablet';
import LaptopIcon from '@mui/icons-material/Laptop';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CodeIcon from '@mui/icons-material/Code';

// Styled components
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  minHeight: '60vh',
  maxHeight: '80vh',
}));

const PreviewFrame = styled(Box)(({ theme, device }) => {
  const deviceSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    laptop: { width: '1366px', height: '768px' },
    desktop: { width: '100%', height: '100%' }
  };
  
  return {
    width: deviceSizes[device].width,
    height: deviceSizes[device].height,
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: theme.shadows[3],
    margin: '0 auto'
  };
});

const DeviceFrame = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[4],
  backgroundColor: 'white',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const CodeView = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  fontFamily: 'monospace',
  padding: theme.spacing(2),
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }
}));

/**
 * Dialogue de prévisualisation du contenu de la page
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - État d'ouverture du dialogue
 * @param {Function} props.onClose - Fonction de fermeture du dialogue
 * @param {Object} props.pageData - Données de la page à prévisualiser
 */
const PreviewDialog = ({ open, onClose, pageData }) => {
  const [device, setDevice] = useState('desktop');
  const [tabValue, setTabValue] = useState(0);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (open && pageData) {
      setLoading(true);
      
      // Simuler le temps de génération du HTML
      const timer = setTimeout(() => {
        setPreviewHtml(generatePreviewHtml(pageData));
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [open, pageData]);
  
  // Gestionnaire de changement d'appareil
  const handleDeviceChange = (newDevice) => {
    setDevice(newDevice);
  };
  
  // Gestionnaire de changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Générer le HTML pour la prévisualisation
  const generatePreviewHtml = (data) => {
    if (!data) return '';
    
    try {
      // Début du HTML
      let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title || 'Prévisualisation'}</title>
    <meta name="description" content="${data.meta?.description || ''}">
    <meta name="keywords" content="${data.meta?.keywords || ''}">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --color-primary: ${data.theme?.colors?.primary || '#0a4b44'};
            --color-accent: ${data.theme?.colors?.accent || '#d4a039'};
            --color-light: ${data.theme?.colors?.light || '#f9f5f0'};
            --color-dark: ${data.theme?.colors?.dark || '#1f332e'};
            --color-neutral: ${data.theme?.colors?.neutral || '#e6e0d4'};
            --font-heading: ${data.theme?.fonts?.heading || "'Cormorant Garamond', serif"};
            --font-body: ${data.theme?.fonts?.body || "'Montserrat', sans-serif"};
        }
        
        body {
            font-family: var(--font-body);
            color: var(--color-dark);
            background-color: var(--color-light);
            overflow-x: hidden;
            position: relative;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            font-weight: 400;
            color: var(--color-primary);
        }

        /* En-tête */
        .header {
            padding: 2rem 0;
            background-color: var(--color-light);
            position: relative;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: var(--color-primary);
        }

        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-menu li a {
            text-decoration: none;
            color: var(--color-dark);
            transition: color 0.3s;
        }

        .nav-menu li a:hover {
            color: var(--color-accent);
        }

        .cta-btn {
            background-color: var(--color-primary);
            color: white;
            border: none;
            padding: 0.8rem 1.8rem;
            border-radius: 50px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .cta-btn:hover {
            background-color: var(--color-accent);
        }

        /* Section héro */
        .hero {
            min-height: 80vh;
            display: flex;
            align-items: center;
            background-color: var(--color-primary);
            color: white;
            padding: 4rem 0;
        }

        .hero-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            gap: 4rem;
        }

        .hero-content {
            flex: 1;
        }

        .hero-title {
            font-size: 4rem;
            color: white;
            margin-bottom: 1.5rem;
        }

        .hero-subtitle {
            font-size: 1.2rem;
            margin-bottom: 2.5rem;
            opacity: 0.9;
        }

        .hero-btn {
            display: inline-block;
            background-color: var(--color-accent);
            color: var(--color-dark);
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-size: 1rem;
            text-decoration: none;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
        }

        .hero-btn:hover {
            background-color: white;
        }

        .hero-image {
            flex: 1;
        }

        .hero-img-shape {
            width: 100%;
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            overflow: hidden;
        }

        .hero-img-shape img {
            width: 100%;
            height: auto;
            object-fit: cover;
        }

        /* Sections génériques */
        section {
            padding: 5rem 0;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Pied de page */
        .footer {
            background-color: var(--color-primary);
            color: white;
            padding: 4rem 0 2rem;
        }

        .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .footer-top {
            display: flex;
            flex-wrap: wrap;
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .footer-info {
            flex: 2;
            min-width: 300px;
        }

        .footer-logo {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: white;
            margin-bottom: 1rem;
        }

        .footer-desc {
            max-width: 400px;
            margin-bottom: 2rem;
            opacity: 0.8;
        }

        .footer-nav {
            flex: 1;
            min-width: 150px;
        }

        .footer-heading {
            font-family: var(--font-heading);
            font-size: 1.3rem;
            color: white;
            margin-bottom: 1.5rem;
        }

        .footer-links {
            list-style: none;
        }

        .footer-links li {
            margin-bottom: 0.8rem;
        }

        .footer-links li a {
            color: white;
            opacity: 0.8;
            text-decoration: none;
            transition: opacity 0.3s;
        }

        .footer-links li a:hover {
            opacity: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-container {
                flex-direction: column;
                text-align: center;
            }

            .footer-top {
                flex-direction: column;
                gap: 2rem;
            }
        }
    </style>
</head>
<body>
`;
      
      // Générer le contenu en fonction des sections
      if (data.sections && data.sections.length > 0) {
        data.sections.forEach(section => {
          switch (section.type) {
            case 'header':
              html += generateHeaderHtml(section);
              break;
            case 'section':
              if (section.className === 'hero') {
                html += generateHeroHtml(section);
              } else {
                html += generateGenericSectionHtml(section);
              }
              break;
            case 'footer':
              html += generateFooterHtml(section);
              break;
            default:
              html += `<div class="${section.className || ''}">Section de type ${section.type}</div>`;
          }
        });
      }
      
      // Fin du HTML
      html += `
  <script>
    // Scripts de prévisualisation
  </script>
</body>
</html>`;
      
      return html;
    } catch (error) {
      console.error('Erreur lors de la génération du HTML:', error);
      return `<html><body><h1>Erreur de prévisualisation</h1><p>${error.message}</p></body></html>`;
    }
  };
  
  // Générer le HTML d'en-tête
  const generateHeaderHtml = (section) => {
    let headerContent = '';
    
    if (section.content && section.content.length > 0) {
      // Extraire le logo, la navigation et le bouton CTA
      const logoItem = section.content.find(item => item.type === 'logo');
      const navItem = section.content.find(item => item.type === 'navigation');
      const ctaItem = section.content.find(item => item.type === 'button');
      
      // Logo
      const logoHtml = logoItem ? `<div class="logo">${logoItem.text}</div>` : '<div class="logo">Logo</div>';
      
      // Navigation
      let navHtml = '<ul class="nav-menu">';
      if (navItem && navItem.items && navItem.items.length > 0) {
        navItem.items.forEach(item => {
          navHtml += `<li><a href="${item.url}">${item.label}</a></li>`;
        });
      } else {
        navHtml += '<li><a href="#">Menu item</a></li>';
      }
      navHtml += '</ul>';
      
      // Bouton CTA
      const ctaHtml = ctaItem ? 
        `<button class="cta-btn">${ctaItem.text}</button>` : 
        '';
      
      headerContent = `
  <header class="${section.className || 'header'}">
    <div class="nav-container">
      ${logoHtml}
      ${navHtml}
      ${ctaHtml}
    </div>
  </header>`;
    } else {
      // En-tête par défaut
      headerContent = `
  <header class="${section.className || 'header'}">
    <div class="nav-container">
      <div class="logo">Ayurveda Équilibre</div>
      <ul class="nav-menu">
        <li><a href="#">Accueil</a></li>
        <li><a href="#">Soins</a></li>
        <li><a href="#">Philosophie</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
      <button class="cta-btn">Prendre RDV</button>
    </div>
  </header>`;
    }
    
    return headerContent;
  };
  
  // Générer le HTML de la section héro
  const generateHeroHtml = (section) => {
    let heroContent = '';
    
    if (section.content && section.content.length > 0) {
      // Extraire le contenu héro et l'image
      const contentItem = section.content.find(item => item.type === 'heroContent');
      const imageItem = section.content.find(item => item.type === 'heroImage');
      
      // Contenu texte
      let textHtml = '';
      if (contentItem) {
        textHtml = `
      <div class="hero-content">
        <h1 class="hero-title">${contentItem.title || 'Titre principal'}</h1>
        <p class="hero-subtitle">${contentItem.subtitle || 'Sous-titre ou description'}</p>
        <button class="hero-btn">${contentItem.buttonText || 'Bouton d\'action'}</button>
      </div>`;
      }
      
      // Image
      let imageHtml = '';
      if (imageItem) {
        imageHtml = `
      <div class="hero-image">
        <div class="hero-img-shape">
          <img src="${imageItem.src}" alt="${imageItem.alt || ''}">
        </div>
      </div>`;
      }
      
      heroContent = `
  <section class="${section.className || 'hero'}">
    <div class="hero-container">
      ${textHtml}
      ${imageHtml}
    </div>
  </section>`;
    } else {
      // Section héro par défaut
      heroContent = `
  <section class="${section.className || 'hero'}">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Retrouvez l'harmonie naturelle</h1>
        <p class="hero-subtitle">Découvrez les bienfaits millénaires de l'Ayurveda pour équilibrer votre corps et votre esprit</p>
        <button class="hero-btn">Découvrir nos soins</button>
      </div>
      <div class="hero-image">
        <div class="hero-img-shape">
          <img src="https://via.placeholder.com/600x400" alt="Image d'illustration">
        </div>
      </div>
    </div>
  </section>`;
    }
    
    return heroContent;
  };
  
  // Générer le HTML pour une section générique
  const generateGenericSectionHtml = (section) => {
    let sectionContent = `
  <section class="${section.className || ''}">
    <div class="container">`;
    
    if (section.content && section.content.length > 0) {
      section.content.forEach(item => {
        switch (item.type) {
          case 'heading':
            sectionContent += `<h${item.level || 2} class="${item.className || ''}">${item.text}</h${item.level || 2}>`;
            break;
          case 'paragraph':
            sectionContent += `<p class="${item.className || ''}">${item.text}</p>`;
            break;
          case 'image':
            sectionContent += `<img src="${item.src}" alt="${item.alt || ''}" class="${item.className || ''}">`;
            break;
          case 'button':
            sectionContent += `<button class="${item.className || 'btn'}">${item.text}</button>`;
            break;
          case 'sectionHeader':
            sectionContent += `
      <div class="section-title-container">
        <h2 class="section-title">${item.title}</h2>
        <p class="section-subtitle">${item.subtitle}</p>
      </div>`;
            break;
          default:
            sectionContent += `<div>Élément de type ${item.type}</div>`;
        }
      });
    } else {
      sectionContent += `
      <h2>Titre de section</h2>
      <p>Contenu de la section...</p>`;
    }
    
    sectionContent += `
    </div>
  </section>`;
    
    return sectionContent;
  };
  
  // Générer le HTML du pied de page
  const generateFooterHtml = (section) => {
    let footerContent = '';
    
    if (section.content && section.content.length > 0) {
      // Extraire le logo, la description et les colonnes
      const logoItem = section.content.find(item => item.type === 'logo');
      const descItem = section.content.find(item => item.type === 'text');
      const columnsItem = section.content.find(item => item.type === 'footerColumns');
      const copyrightItem = section.content.find(item => item.type === 'copyright');
      
      // Information du footer
      let infoHtml = '';
      if (logoItem || descItem) {
        infoHtml = `
      <div class="footer-info">
        ${logoItem ? `<div class="footer-logo">${logoItem.text}</div>` : ''}
        ${descItem ? `<p class="footer-desc">${descItem.content}</p>` : ''}
      </div>`;
      }
      
      // Colonnes de navigation
      let columnsHtml = '';
      if (columnsItem && columnsItem.columns && columnsItem.columns.length > 0) {
        columnsItem.columns.forEach(column => {
          let linksHtml = '';
          if (column.links && column.links.length > 0) {
            linksHtml = '<ul class="footer-links">';
            column.links.forEach(link => {
              if (link.isText) {
                linksHtml += `<li>${link.label}</li>`;
              } else {
                linksHtml += `<li><a href="${link.url}">${link.label}</a></li>`;
              }
            });
            linksHtml += '</ul>';
          }
          
          columnsHtml += `
      <div class="footer-nav">
        <h3 class="footer-heading">${column.heading}</h3>
        ${linksHtml}
      </div>`;
        });
      }
      
      // Copyright
      const copyrightHtml = copyrightItem ? 
        `<div class="footer-bottom"><p>${copyrightItem.text}</p></div>` : 
        '';
      
      footerContent = `
  <footer class="${section.className || 'footer'}">
    <div class="footer-container">
      <div class="footer-top">
        ${infoHtml}
        ${columnsHtml}
      </div>
      ${copyrightHtml}
    </div>
  </footer>`;
    } else {
      // Pied de page par défaut
      footerContent = `
  <footer class="${section.className || 'footer'}">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-info">
          <div class="footer-logo">Ayurveda Équilibre</div>
          <p class="footer-desc">Un espace dédié à l'équilibre holistique où la sagesse ancestrale rencontre le bien-être moderne.</p>
        </div>
        <div class="footer-nav">
          <h3 class="footer-heading">Navigation</h3>
          <ul class="footer-links">
            <li><a href="#">Accueil</a></li>
            <li><a href="#">Soins</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2023 Ayurveda Équilibre. Tous droits réservés.</p>
      </div>
    </div>
  </footer>`;
    }
    
    return footerContent;
  };
  
  // Rendu du contenu de prévisualisation
  const renderPreviewContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (tabValue === 0) {
      // Prévisualisation du rendu
      return (
        <DeviceFrame>
          <PreviewFrame device={device}>
            <iframe
              title="preview"
              srcDoc={previewHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </PreviewFrame>
        </DeviceFrame>
      );
    } else {
      // Prévisualisation du code
      return (
        <CodeView>
          <pre>{previewHtml}</pre>
        </CodeView>
      );
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" component="span">
            Prévisualisation: {pageData?.title || 'Page'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Tooltip title="Mobile">
              <IconButton 
                onClick={() => handleDeviceChange('mobile')} 
                color={device === 'mobile' ? 'primary' : 'default'}
                disabled={tabValue !== 0}
              >
                <PhoneAndroidIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tablette">
              <IconButton 
                onClick={() => handleDeviceChange('tablet')} 
                color={device === 'tablet' ? 'primary' : 'default'}
                disabled={tabValue !== 0}
              >
                <TabletIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Portable">
              <IconButton 
                onClick={() => handleDeviceChange('laptop')} 
                color={device === 'laptop' ? 'primary' : 'default'}
                disabled={tabValue !== 0}
              >
                <LaptopIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bureau">
              <IconButton 
                onClick={() => handleDeviceChange('desktop')} 
                color={device === 'desktop' ? 'primary' : 'default'}
                disabled={tabValue !== 0}
              >
                <DesktopWindowsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="preview tabs"
        >
          <Tab icon={<DesktopWindowsIcon />} label="Rendu" />
          <Tab icon={<CodeIcon />} label="Code" />
        </Tabs>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <StyledDialogContent>
        {renderPreviewContent()}
      </StyledDialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewDialog;