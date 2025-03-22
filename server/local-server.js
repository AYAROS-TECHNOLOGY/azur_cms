const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Configuration
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
// const JWT_SECRET = 'ayurveda-cms-secret-dev';
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Création des répertoires nécessaires
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(MEDIA_DIR);
fs.ensureDirSync(path.join(DATA_DIR, 'pages'));
fs.ensureDirSync(path.join(DATA_DIR, 'themes'));
fs.ensureDirSync(path.join(DATA_DIR, 'versions'));
fs.ensureDirSync(path.join(DATA_DIR, 'settings'));

// Initialisation du serveur Express
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));






// Middleware d'authentification
const jwt = require('jsonwebtoken');

// Définition explicite de la clé secrète JWT
const JWT_SECRET = 'ayurveda-cms-secret-dev';  // ou process.env.JWT_SECRET en production

const authenticate = (req, res, next) => {
  console.log('Middleware d\'authentification appelé');
  
  const authHeader = req.headers.authorization;
  console.log('En-tête d\'autorisation:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log('Aucun token fourni');
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  try {
    const decoded = jwt.verify(token, functions.config().jwt.secret || 'ayurveda-cms-secret');

    console.log('Token décodé avec succès:', decoded);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error.message);
    console.error('Token problématique:', token);
    
    return res.status(401).json({ 
      message: 'Token invalide',
      error: error.message,
      hint: 'Vérifiez que le JWT_SECRET est identique lors de la création et de la vérification du token',
    });
  }
};

// Route d'authentification
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // En développement, utilisateur codé en dur
    const validUser = {
      username: 'admin',
      // Mot de passe haché "admin123"
      passwordHash: '$2a$10$LJVoxD5zVjcP7p6RjIIKxuCz6zQxJWVWO8qv2dZyLfNgqSUXziiTO',
      role: 'admin'
    };
    
    if (username !== validUser.username || !bcrypt.compareSync(password, validUser.passwordHash)) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // Génération du token JWT
    const token = jwt.sign(
      { id: '1', username: validUser.username, role: validUser.role },
      'ayurveda-cms-secret',  // La clé secrète utilisée ici doit être la même pour la vérification
      { expiresIn: '8h' }
    );
    
    
    res.json({ token, user: { username: validUser.username, role: validUser.role } });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer la structure du site
app.get('/api/site-structure', authenticate, async (req, res) => {
  try {
    const structureFile = path.join(DATA_DIR, 'structure.json');
    
    if (!fs.existsSync(structureFile)) {
      // Si la structure n'existe pas encore, renvoyer une structure par défaut
      return res.json({
        pages: [
          {
            id: 'home',
            title: 'Accueil',
            path: '/',
            template: 'home',
            isPublished: true
          }
        ],
        navigation: {
          main: [
            { id: 'home', label: 'Accueil', path: '/' }
          ]
        }
      });
    }
    
    // Récupérer le contenu du fichier
    const structure = await fs.readJson(structureFile);
    
    res.json(structure);
  } catch (error) {
    console.error('Erreur lors de la récupération de la structure:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour la structure du site
app.put('/api/site-structure', authenticate, async (req, res) => {
  try {
    const structure = req.body;
    const structureFile = path.join(DATA_DIR, 'structure.json');
    
    // Enregistrer l'ancienne version pour le versioning
    await createVersionSnapshot('', 'structure.json');
    
    // Écrire la nouvelle structure
    await fs.writeJson(structureFile, structure, { spaces: 2 });
    
    res.json({ message: 'Structure mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la structure:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer le contenu d'une page
app.get('/api/pages/:pageId', authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const pageFile = path.join(DATA_DIR, 'pages', `${pageId}.json`);
    
    if (!fs.existsSync(pageFile)) {
      return res.status(404).json({ message: 'Page non trouvée' });
    }
    
    const pageContent = await fs.readJson(pageFile);
    
    res.json(pageContent);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page ${req.params.pageId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour le contenu d'une page
app.put('/api/pages/:pageId', authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const pageContent = req.body;
    const pageFile = path.join(DATA_DIR, 'pages', `${pageId}.json`);
    
    // Enregistrer l'ancienne version pour le versioning
    await createVersionSnapshot('pages', `${pageId}.json`);
    
    // Écrire le nouveau contenu de la page
    await fs.writeJson(pageFile, pageContent, { spaces: 2 });
    
    res.json({ message: 'Page mise à jour avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la page ${req.params.pageId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour créer une nouvelle page
app.post('/api/pages', authenticate, async (req, res) => {
  try {
    const { pageContent, pageId, addToNavigation } = req.body;
    
    if (!pageId || !pageContent) {
      return res.status(400).json({ message: 'ID de page et contenu requis' });
    }
    
    // Vérifier si la page existe déjà
    const pageFile = path.join(DATA_DIR, 'pages', `${pageId}.json`);
    
    if (fs.existsSync(pageFile)) {
      return res.status(409).json({ message: 'Une page avec cet ID existe déjà' });
    }
    
    // Créer le fichier de contenu de la page
    await fs.writeJson(pageFile, pageContent, { spaces: 2 });
    
    // Si demandé, ajouter la page à la navigation
    if (addToNavigation) {
      const structureFile = path.join(DATA_DIR, 'structure.json');
      
      if (fs.existsSync(structureFile)) {
        const structure = await fs.readJson(structureFile);
        
        // Ajouter la page à la liste des pages
        structure.pages.push({
          id: pageId,
          title: pageContent.title || pageId,
          path: pageContent.path || `/${pageId}`,
          template: pageContent.template || 'default',
          isPublished: false
        });
        
        // Ajouter à la navigation principale si demandé
        if (addToNavigation === 'main') {
          structure.navigation.main.push({
            id: pageId,
            label: pageContent.title || pageId,
            path: pageContent.path || `/${pageId}`
          });
        }
        
        // Enregistrer la structure mise à jour
        await fs.writeJson(structureFile, structure, { spaces: 2 });
      }
    }
    
    res.status(201).json({ message: 'Page créée avec succès', pageId });
  } catch (error) {
    console.error('Erreur lors de la création de la page:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour supprimer une page
app.delete('/api/pages/:pageId', authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Supprimer le fichier de contenu de la page
    const pageFile = path.join(DATA_DIR, 'pages', `${pageId}.json`);
    
    if (!fs.existsSync(pageFile)) {
      return res.status(404).json({ message: 'Page non trouvée' });
    }
    
    // Créer une sauvegarde avant suppression
    await createVersionSnapshot('pages', `${pageId}.json`);
    
    // Supprimer le fichier
    await fs.remove(pageFile);
    
    // Mettre à jour la structure du site pour retirer la page
    const structureFile = path.join(DATA_DIR, 'structure.json');
    
    if (fs.existsSync(structureFile)) {
      const structure = await fs.readJson(structureFile);
      
      // Retirer la page de la liste des pages
      structure.pages = structure.pages.filter(page => page.id !== pageId);
      
      // Retirer de toutes les navigations
      Object.keys(structure.navigation).forEach(navKey => {
        structure.navigation[navKey] = structure.navigation[navKey].filter(item => item.id !== pageId);
      });
      
      // Enregistrer la structure mise à jour
      await fs.writeJson(structureFile, structure, { spaces: 2 });
    }
    
    res.json({ message: 'Page supprimée avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page ${req.params.pageId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion des médias et ressources
app.post('/api/media/upload', authenticate, async (req, res) => {
  try {
    const { filename, fileContent, contentType, folder = 'images' } = req.body;
    
    if (!filename || !fileContent || !contentType) {
      return res.status(400).json({ message: 'Nom de fichier, contenu et type de contenu requis' });
    }
    
    // Créer un nom de fichier unique pour éviter les collisions
    const uniqueFileName = `${folder}/${uuidv4()}-${filename}`;
    const outputPath = path.join(MEDIA_DIR, uniqueFileName);
    
    // Créer le répertoire si nécessaire
    await fs.ensureDir(path.dirname(outputPath));
    
    // Convertir le contenu base64 en Buffer
    const fileBuffer = Buffer.from(fileContent.replace(/^data:[^;]+;base64,/, ''), 'base64');
    
    // Écrire le fichier
    await fs.writeFile(outputPath, fileBuffer);
    
    // URL pour le développement local
    const fileUrl = `/media/${uniqueFileName}`;
    
    res.status(201).json({ message: 'Fichier uploadé avec succès', filename: uniqueFileName, url: fileUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Servir les fichiers médias
app.use('/media', express.static(MEDIA_DIR));

// Liste des médias
app.get('/api/media', authenticate, async (req, res) => {
  try {
    const files = [];
    
    // Fonction récursive pour parcourir les répertoires
    const readDirRecursive = async (dir, baseDir = '') => {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.join(baseDir, item.name);
        
        if (item.isDirectory()) {
          await readDirRecursive(fullPath, relativePath);
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            name: relativePath,
            url: `/media/${relativePath}`,
            contentType: getContentType(item.name),
            size: stats.size,
            uploadedAt: stats.mtime.toISOString(),
            uploadedBy: 'admin'
          });
        }
      }
    };
    
    await readDirRecursive(MEDIA_DIR);
    
    res.json(files);
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Suppression d'un média
app.delete('/api/media/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(MEDIA_DIR, decodeURIComponent(filename));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    await fs.remove(filePath);
    
    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier ${req.params.filename}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer les thèmes disponibles
app.get('/api/themes', authenticate, async (req, res) => {
  try {
    const themesDir = path.join(DATA_DIR, 'themes');
    const files = await fs.readdir(themesDir);
    
    const themes = [];
    
    for (const file of files) {
      if (file.endsWith('theme.json')) {
        const themeContent = await fs.readJson(path.join(themesDir, file));
        themes.push({
          id: file.replace('theme.json', ''),
          ...themeContent
        });
      }
    }
    
    res.json(themes);
  } catch (error) {
    console.error('Erreur lors de la récupération des thèmes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer le thème actif
app.get('/api/themes/active', authenticate, async (req, res) => {
  try {
    const themeFile = path.join(DATA_DIR, 'active-theme.json');
    
    if (!fs.existsSync(themeFile)) {
      // Thème par défaut
      return res.json({
        id: 'default',
        name: 'Thème par défaut',
        colors: {
          primary: '#0a4b44',
          accent: '#d4a039',
          light: '#f9f5f0',
          dark: '#1f332e',
          neutral: '#e6e0d4'
        },
        fonts: {
          heading: "'Cormorant Garamond', serif",
          body: "'Montserrat', sans-serif"
        }
      });
    }
    
    const activeTheme = await fs.readJson(themeFile);
    
    res.json(activeTheme);
  } catch (error) {
    console.error('Erreur lors de la récupération du thème actif:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour le thème actif
app.put('/api/themes/active', authenticate, async (req, res) => {
  try {
    const theme = req.body;
    const themeFile = path.join(DATA_DIR, 'active-theme.json');
    
    // Créer un snapshot du thème actuel avant modification
    await createVersionSnapshot('', 'active-theme.json');
    
    // Enregistrer le nouveau thème actif
    await fs.writeJson(themeFile, theme, { spaces: 2 });
    
    res.json({ message: 'Thème actif mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thème actif:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour créer un nouveau thème
app.post('/api/themes', authenticate, async (req, res) => {
  try {
    const { theme, id } = req.body;
    
    if (!id || !theme) {
      return res.status(400).json({ message: 'ID de thème et données requises' });
    }
    
    const themeFile = path.join(DATA_DIR, 'themes', `${id}-theme.json`);
    
    if (fs.existsSync(themeFile)) {
      return res.status(409).json({ message: 'Un thème avec cet ID existe déjà' });
    }
    
    // Enregistrer le nouveau thème
    await fs.writeJson(themeFile, theme, { spaces: 2 });
    
    res.status(201).json({ message: 'Thème créé avec succès', id });
  } catch (error) {
    console.error('Erreur lors de la création du thème:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour générer le site statique
app.post('/api/publish', authenticate, async (req, res) => {
  try {
    // Simuler un délai de génération
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enregistrer l'action de publication dans l'historique
    const publishLogFile = path.join(DATA_DIR, 'publish-log', `publish-${new Date().toISOString()}.json`);
    await fs.ensureDir(path.dirname(publishLogFile));
    
    await fs.writeJson(publishLogFile, {
      publishedAt: new Date().toISOString(),
      publishedBy: req.user.username,
      status: 'success'
    });
    
    res.json({ message: 'Site publié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la publication du site:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer l'historique des versions
app.get('/api/versions', authenticate, async (req, res) => {
  try {
    const versionsDir = path.join(DATA_DIR, 'versions');
    const versions = [];
    
    // Fonction récursive pour parcourir les répertoires
    const readDirRecursive = async (dir, baseDir = '') => {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.join(baseDir, item.name);
        
        if (item.isDirectory()) {
          await readDirRecursive(fullPath, relativePath);
        } else {
          const stats = await fs.stat(fullPath);
          versions.push({
            file: relativePath,
            timestamp: stats.mtime.toISOString(),
            user: 'admin'
          });
        }
      }
    };
    
    await readDirRecursive(versionsDir);
    
    // Trier par date de création (plus récente en premier)
    versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(versions);
  } catch (error) {
    console.error('Erreur lors de la récupération des versions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour restaurer une version
app.post('/api/versions/restore', authenticate, async (req, res) => {
  try {
    const { versionFile, targetFile } = req.body;
    
    if (!versionFile || !targetFile) {
      return res.status(400).json({ message: 'Fichier de version et fichier cible requis' });
    }
    
    const sourceFile = path.join(DATA_DIR, 'versions', versionFile);
    
    if (!fs.existsSync(sourceFile)) {
      return res.status(404).json({ message: 'Version non trouvée' });
    }
    
    // Créer un snapshot de l'état actuel avant restauration
    const targetPath = targetFile.split('/');
    const targetDir = targetPath.slice(0, -1).join('/');
    const targetFileName = targetPath[targetPath.length - 1];
    await createVersionSnapshot(targetDir, targetFileName);
    
    // Copier le contenu de la version vers le fichier cible
    const content = await fs.readFile(sourceFile);
    const destFile = path.join(DATA_DIR, targetFile);
    
    // Créer le répertoire cible si nécessaire
    await fs.ensureDir(path.dirname(destFile));
    
    // Écrire le fichier
    await fs.writeFile(destFile, content);
    
    res.json({ message: 'Version restaurée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la restauration de la version:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour exporter un thème
app.get('/api/themes/:themeId/export', authenticate, async (req, res) => {
  try {
    const { themeId } = req.params;
    const themeFile = path.join(DATA_DIR, 'themes', `${themeId}-theme.json`);
    
    if (!fs.existsSync(themeFile)) {
      return res.status(404).json({ message: 'Thème non trouvé' });
    }
    
    const theme = await fs.readJson(themeFile);
    
    // Dans le serveur de développement, on renvoie simplement le thème
    res.json({
      message: 'Thème prêt pour l\'export',
      theme,
      downloadUrl: `/api/themes/${themeId}/download`
    });
  } catch (error) {
    console.error(`Erreur lors de l'export du thème ${req.params.themeId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer les paramètres SMTP
app.get('/api/settings/smtp', authenticate, async (req, res) => {
  try {
    const smtpFile = path.join(DATA_DIR, 'settings', 'smtp.json');
    
    if (!fs.existsSync(smtpFile)) {
      // Paramètres SMTP par défaut
      return res.json({
        host: '',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        },
        from: 'contact@ayurveda-equilibre.com'
      });
    }
    
    const smtpSettings = await fs.readJson(smtpFile);
    
    // Ne pas renvoyer le mot de passe complet
    if (smtpSettings.auth && smtpSettings.auth.pass) {
      smtpSettings.auth.pass = '********';
    }
    
    res.json(smtpSettings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres SMTP:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour les paramètres SMTP
app.put('/api/settings/smtp', authenticate, async (req, res) => {
  try {
    const smtpSettings = req.body;
    const smtpFile = path.join(DATA_DIR, 'settings', 'smtp.json');
    
    // Si le fichier existe déjà et que le mot de passe est masqué, récupérer le mot de passe actuel
    if (fs.existsSync(smtpFile) && smtpSettings.auth?.pass === '********') {
      const currentSettings = await fs.readJson(smtpFile);
      
      if (currentSettings.auth?.pass) {
        smtpSettings.auth.pass = currentSettings.auth.pass;
      }
    }
    
    // Enregistrer les paramètres SMTP
    await fs.writeJson(smtpFile, smtpSettings, { spaces: 2 });
    
    res.json({ message: 'Paramètres SMTP mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres SMTP:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Servir la documentation Swagger

app.use('/api-docs/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/yaml');
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});
app.use('/api-docs', express.static(path.join(__dirname, 'public/api-docs')));


// Fonction utilitaire pour créer un snapshot d'un fichier avant modification (versioning)
async function createVersionSnapshot(directory, filename) {
  try {
    const sourceFilePath = path.join(DATA_DIR, directory, filename);
    
    if (!fs.existsSync(sourceFilePath)) {
      return; // Ne rien faire si le fichier n'existe pas
    }
    
    const content = await fs.readFile(sourceFilePath);
    
    // Créer un nom de fichier unique pour la version
    const timestamp = new Date().toISOString();
    const versionDir = path.join(DATA_DIR, 'versions', directory);
    await fs.ensureDir(versionDir);
    
    const versionFile = path.join(versionDir, `${filename}-${timestamp}`);
    
    // Enregistrer le snapshot
    await fs.writeFile(versionFile, content);
    
    return path.relative(DATA_DIR, versionFile);
  } catch (error) {
    console.error('Erreur lors de la création d\'un snapshot de version:', error);
    throw error;
  }
}

// Fonction utilitaire pour déterminer le type de contenu basé sur l'extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Fonction d'initialisation des données par défaut
function initDefaultContent() {
  const structureFile = path.join(DATA_DIR, 'structure.json');
  
  if (!fs.existsSync(structureFile)) {
    // Structure par défaut du site
    const defaultStructure = {
      pages: [
        {
          id: 'home',
          title: 'Accueil',
          path: '/',
          template: 'home',
          isPublished: true
        }
      ],
      navigation: {
        main: [
          { id: 'home', label: 'Accueil', path: '/' }
        ]
      }
    };
    
    fs.writeJsonSync(structureFile, defaultStructure, { spaces: 2 });
    console.log('Structure par défaut créée');
  }
  
  const themeFile = path.join(DATA_DIR, 'active-theme.json');
  
  if (!fs.existsSync(themeFile)) {
    // Thème par défaut
    const defaultTheme = {
      id: 'default',
      name: 'Thème par défaut',
      colors: {
        primary: '#0a4b44',
        accent: '#d4a039',
        light: '#f9f5f0',
        dark: '#1f332e',
        neutral: '#e6e0d4'
      },
      fonts: {
        heading: "'Cormorant Garamond', serif",
        body: "'Montserrat', sans-serif"
      }
    };
    
    fs.writeJsonSync(themeFile, defaultTheme, { spaces: 2 });
    console.log('Thème par défaut créé');
  }
  
  // Créer une page d'accueil par défaut si elle n'existe pas
  const homePage = path.join(DATA_DIR, 'pages', 'home.json');
  
  if (!fs.existsSync(homePage)) {
    const defaultHomePage = {
      title: "Ayurveda Équilibre",
      meta: {
        description: "Centre de bien-être ayurvédique pour retrouver l'harmonie naturelle",
        keywords: "ayurveda, massage, bien-être, soins, équilibre"
      },
      sections: [
        {
          id: "header",
          type: "header",
          className: "header",
          content: [
            {
              id: "header-logo",
              type: "logo",
              text: "Ayurveda Équilibre"
            },
            {
              id: "main-navigation",
              type: "navigation",
              items: [
                {
                  id: "nav-item-home",
                  label: "Accueil",
                  url: "#accueil"
                },
                {
                  id: "nav-item-services",
                  label: "Soins",
                  url: "#services"
                },
                {
                  id: "nav-item-philosophy",
                  label: "Philosophie",
                  url: "#philosophy"
                },
                {
                  id: "nav-item-testimonials",
                  label: "Témoignages",
                  url: "#testimonials"
                },
                {
                  id: "nav-item-contact",
                  label: "Contact",
                  url: "#contact"
                }
              ]
            },
            {
              id: "header-cta",
              type: "button",
              text: "Prendre RDV",
              url: "#contact",
              className: "cta-btn"
            }
          ]
        },
        {
          id: "hero",
          type: "section",
          className: "hero",
          content: [
            {
              id: "hero-content",
              type: "heroContent",
              title: "Retrouvez l'harmonie naturelle",
              subtitle: "Découvrez les bienfaits millénaires de l'Ayurveda pour équilibrer votre corps et votre esprit",
              buttonText: "Découvrir nos soins",
              buttonLink: "#services"
            }
          ]
        }
      ]
    };
    
    fs.writeJsonSync(homePage, defaultHomePage, { spaces: 2 });
    console.log('Page d\'accueil par défaut créée');
  }
}

// Initialiser les données par défaut
initDefaultContent();

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur de développement démarré sur http://localhost:${PORT}`);
});