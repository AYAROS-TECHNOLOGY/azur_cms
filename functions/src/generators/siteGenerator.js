const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const { generateHtmlFromStructure } = require('../utils/htmlParser');

// Initialisation du stockage
const storage = new Storage();

/**
 * Classe responsable de la génération du site statique
 */
class SiteGenerator {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), `ayurveda-site-${uuidv4()}`);
    this.structure = null;
    this.pages = {};
    this.theme = null;
    this.assets = {};
    this.bucketNames = {
      content: process.env.BUCKET_CONTENT || 'ayurveda-cms-content',
      media: process.env.BUCKET_MEDIA || 'ayurveda-cms-media',
      output: process.env.BUCKET_OUTPUT || 'ayurveda-site-output'
    };
  }
  
  /**
   * Initialise la génération du site
   */
  async initialize() {
    console.log('Initialisation de la génération du site...');
    await fs.ensureDir(this.tempDir);
    
    // Créer les répertoires nécessaires
    await fs.ensureDir(path.join(this.tempDir, 'css'));
    await fs.ensureDir(path.join(this.tempDir, 'js'));
    await fs.ensureDir(path.join(this.tempDir, 'images'));
    
    console.log('Répertoires temporaires créés:', this.tempDir);
  }
  
  /**
   * Charge toutes les données nécessaires pour le site
   */
  async loadData() {
    console.log('Chargement des données...');
    
    try {
      // Charger la structure du site
      const structureFile = storage.bucket(this.bucketNames.content).file('structure.json');
      const [structureContent] = await structureFile.download();
      this.structure = JSON.parse(structureContent.toString());
      
      // Charger le thème actif
      const themeFile = storage.bucket(this.bucketNames.content).file('active-theme.json');
      const [themeContent] = await themeFile.download();
      this.theme = JSON.parse(themeContent.toString());
      
      // Charger le contenu de chaque page publiée
      const pagePromises = this.structure.pages
        .filter(page => page.isPublished)
        .map(async (page) => {
          try {
            const pageFile = storage.bucket(this.bucketNames.content).file(`pages/${page.id}.json`);
            const [pageContent] = await pageFile.download();
            this.pages[page.id] = JSON.parse(pageContent.toString());
          } catch (error) {
            console.error(`Erreur lors du chargement de la page ${page.id}:`, error);
          }
        });
      
      await Promise.all(pagePromises);
      
      console.log(`Données chargées: Structure du site et ${Object.keys(this.pages).length} pages`);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      throw error;
    }
  }
  
  /**
   * Génère les fichiers CSS du site
   */
  async generateStyles() {
    console.log('Génération des styles CSS...');
    
    try {
      // Génération du CSS principal basé sur le thème
      const mainCss = this.generateMainCss();
      
      // Optimisation et minification du CSS
      const minifiedCss = new CleanCSS().minify(mainCss).styles;
      
      // Écriture du fichier CSS
      const cssPath = path.join(this.tempDir, 'css', 'main.css');
      await fs.writeFile(cssPath, minifiedCss);
      
      console.log('Styles CSS générés avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des styles CSS:', error);
      throw error;
    }
  }
  
  /**
   * Génère le CSS principal basé sur le thème
   */
  generateMainCss() {
    return `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
    
    :root {
      --color-primary: ${this.theme.colors.primary};
      --color-accent: ${this.theme.colors.accent};
      --color-light: ${this.theme.colors.light};
      --color-dark: ${this.theme.colors.dark};
      --color-neutral: ${this.theme.colors.neutral};
      --font-heading: ${this.theme.fonts.heading};
      --font-body: ${this.theme.fonts.body};
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-body);
      color: var(--color-dark);
      background-color: var(--color-light);
      overflow-x: hidden;
      position: relative;
    }
    
    /* En-tête */
    .header {
      padding: 2rem 0;
      position: relative;
      width: 100%;
      z-index: 10;
    }
    
    /* ... plus de styles ... */
    `;
  }
  
  /**
   * Génère les fichiers JavaScript du site
   */
  async generateScripts() {
    console.log('Génération des scripts JavaScript...');
    
    try {
      // Génération du JS principal
      const mainJs = this.generateMainJs();
      
      // Optimisation et minification du JS
      const minifiedJs = UglifyJS.minify(mainJs).code;
      
      // Écriture du fichier JS
      const jsPath = path.join(this.tempDir, 'js', 'main.js');
      await fs.writeFile(jsPath, minifiedJs);
      
      console.log('Scripts JavaScript générés avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des scripts JavaScript:', error);
      throw error;
    }
  }
  
  /**
   * Génère le JavaScript principal
   */
  generateMainJs() {
    return `
    document.addEventListener('DOMContentLoaded', function() {
      // Navigation mobile
      const mobileToggle = document.querySelector('.mobile-toggle');
      const navMenu = document.querySelector('.nav-menu');
      
      if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
          this.classList.toggle('active');
          navMenu.classList.toggle('active');
        });
      }
      
      // Navigation fluide
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'smooth'
            });
            
            // Fermer le menu mobile si ouvert
            if (mobileToggle && navMenu) {
              mobileToggle.classList.remove('active');
              navMenu.classList.remove('active');
            }
          }
        });
      });
      
      // Animation au défilement
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      
      animatedElements.forEach(el => {
        observer.observe(el);
      });
    });
    `;
  }
  
  /**
   * Télécharge les ressources médias nécessaires
   */
  async downloadMediaAssets() {
    console.log('Téléchargement des ressources médias...');
    
    try {
      // Lister tous les fichiers médias
      const [files] = await storage.bucket(this.bucketNames.media).getFiles();
      
      // Filtrer pour ne garder que les images et fichiers utilisés
      const imageFiles = files.filter(file => {
        const contentType = file.metadata.contentType || '';
        return contentType.startsWith('image/');
      });
      
      console.log(`Nombre d'images à télécharger: ${imageFiles.length}`);
      
      // Télécharger les images
      const promises = imageFiles.map(async (file) => {
        const destination = path.join(this.tempDir, 'images', path.basename(file.name));
        await file.download({ destination });
      });
      
      await Promise.all(promises);
      console.log('Ressources médias téléchargées avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement des ressources médias:', error);
      throw error;
    }
  }
  
  /**
   * Génère toutes les pages HTML du site
   */
  async generateHtmlPages() {
    console.log('Génération des pages HTML...');
    
    try {
      // Générer chaque page publiée
      for (const pageInfo of this.structure.pages) {
        if (!pageInfo.isPublished) continue;
        
        const pageData = this.pages[pageInfo.id];
        if (!pageData) {
          console.warn(`Aucune donnée trouvée pour la page ${pageInfo.id}, ignorée`);
          continue;
        }
        
        // Enrichir les données de page avec le thème
        const enrichedPageData = {
          ...pageData,
          theme: this.theme
        };
        
        // Générer le HTML
        const html = generateHtmlFromStructure(enrichedPageData);
        
        // Déterminer le chemin de sortie
        const outputPath = pageInfo.id === 'home' 
          ? path.join(this.tempDir, 'index.html')
          : path.join(this.tempDir, `${pageInfo.id}.html`);
        
        // Écrire le fichier HTML
        await fs.writeFile(outputPath, html);
        console.log(`Page générée: ${outputPath}`);
      }
      
      console.log('Pages HTML générées avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des pages HTML:', error);
      throw error;
    }
  }
  
  /**
   * Télécharge le site généré vers le bucket de sortie
   */
  async uploadGeneratedSite() {
    console.log('Téléchargement du site généré vers le bucket de sortie...');
    
    try {
      // Lister tous les fichiers dans le répertoire temporaire
      const allFiles = await this.listAllFiles(this.tempDir);
      
      // Télécharger chaque fichier vers le bucket de sortie
      for (const filePath of allFiles) {
        const relativePath = path.relative(this.tempDir, filePath);
        const destination = relativePath.replace(/\\/g, '/'); // Pour la compatibilité Windows
        
        // Déterminer le type de contenu
        const contentType = this.getContentType(filePath);
        
        // Options de téléchargement
        const uploadOptions = {
          destination,
          metadata: {
            contentType,
            cacheControl: 'public, max-age=3600' // Cache d'une heure
          }
        };
        
        // Télécharger le fichier
        await storage.bucket(this.bucketNames.output).upload(filePath, uploadOptions);
        console.log(`Fichier téléchargé: ${destination}`);
      }
      
      console.log('Site généré téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement du site généré:', error);
      throw error;
    }
  }
  
  /**
   * Liste tous les fichiers dans un répertoire de manière récursive
   */
  async listAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        // Appel récursif pour les sous-répertoires
        const subFiles = await this.listAllFiles(itemPath);
        files.push(...subFiles);
      } else {
        files.push(itemPath);
      }
    }
    
    return files;
  }
  
  /**
   * Détermine le type de contenu MIME en fonction de l'extension
   */
  getContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.otf': 'font/otf',
      '.eot': 'application/vnd.ms-fontobject'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
  
  /**
   * Nettoie les fichiers temporaires
   */
  async cleanup() {
    console.log('Nettoyage des fichiers temporaires...');
    
    try {
      await fs.remove(this.tempDir);
      console.log('Fichiers temporaires supprimés avec succès');
    } catch (error) {
      console.error('Erreur lors du nettoyage des fichiers temporaires:', error);
    }
  }
  
  /**
   * Génère le site statique complet
   */
  async generateSite() {
    console.log('Début de la génération du site statique...');
    
    try {
      // Initialiser la génération
      await this.initialize();
      
      // Charger toutes les données
      await this.loadData();
      
      // Générer les styles CSS
      await this.generateStyles();
      
      // Générer les scripts JavaScript
      await this.generateScripts();
      
      // Télécharger les ressources médias
      await this.downloadMediaAssets();
      
      // Générer les pages HTML
      await this.generateHtmlPages();
      
      // Télécharger le site vers le bucket de sortie
      await this.uploadGeneratedSite();
      
      console.log('Site statique généré avec succès!');
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du site:', error);
      throw error;
    } finally {
      // Nettoyage des fichiers temporaires
      await this.cleanup();
    }
  }
}

/**
 * Fonction principale pour générer le site statique
 */
async function generateStaticSite() {
  const generator = new SiteGenerator();
  return generator.generateSite();
}

module.exports = {
  generateStaticSite
};