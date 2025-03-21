const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialiser Firebase Admin
admin.initializeApp();

// Importer les modules
const { parseHtmlPage } = require('./utils/htmlParser');
const { generateStaticSite } = require('./generators/siteGenerator');
const { generateSitemap } = require('./utils/sitemapGenerator');

// Créer l'application Express
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '50mb' }));

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  try {
    const decoded = jwt.verify(token, functions.config().jwt.secret || 'ayurveda-cms-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Route d'authentification
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Pour la simplicité, nous utilisons un utilisateur codé en dur ici
    // Dans un environnement de production, cela devrait venir d'une base de données
    const validUser = {
      username: 'admin',
      // Mot de passe haché "admin123"
      passwordHash: '$2a$10$LJVoxD5zVjcP7p6RjIIKxuCz6zQxJWVWO8qv2dZyLfNgqSUXziiTO',
      role: 'admin'
    };
    
    if (username !== validUser.username || !bcrypt.compareSync(password, validUser.passwordHash)) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // Générer le token JWT
    const token = jwt.sign(
      { id: '1', username: validUser.username, role: validUser.role },
      functions.config().jwt.secret || 'ayurveda-cms-secret',
      { expiresIn: '8h' }
    );
    
    res.json({ token, user: { username: validUser.username, role: validUser.role } });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer la structure du site
app.get('/site-structure', authenticate, async (req, res) => {
  try {
    const structureRef = admin.storage().bucket().file('ayurveda-cms-content/structure.json');
    const [exists] = await structureRef.exists();
    
    if (!exists) {
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
    const [content] = await structureRef.download();
    const structure = JSON.parse(content.toString());
    
    res.json(structure);
  } catch (error) {
    console.error('Erreur lors de la récupération de la structure:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour la structure du site
app.put('/site-structure', authenticate, async (req, res) => {
  try {
    const structure = req.body;
    const file = admin.storage().bucket().file('ayurveda-cms-content/structure.json');
    
    // Enregistrer l'ancienne version pour le versioning
    await createVersionSnapshot('', 'structure.json');
    
    // Écrire la nouvelle structure
    await file.save(JSON.stringify(structure, null, 2), {
      contentType: 'application/json',
      metadata: {
        updatedBy: req.user.username,
        updatedAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Structure mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la structure:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer le contenu d'une page
app.get('/pages/:pageId', authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const file = admin.storage().bucket().file(`ayurveda-cms-content/pages/${pageId}.json`);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ message: 'Page non trouvée' });
    }
    
    const [content] = await file.download();
    const pageContent = JSON.parse(content.toString());
    
    res.json(pageContent);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page ${req.params.pageId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour le contenu d'une page
app.put('/pages/:pageId', authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const pageContent = req.body;
    const file = admin.storage().bucket().file(`ayurveda-cms-content/pages/${pageId}.json`);
    
    // Enregistrer l'ancienne version pour le versioning
    await createVersionSnapshot('pages', `${pageId}.json`);
    
    // Écrire le nouveau contenu de la page
    await file.save(JSON.stringify(pageContent, null, 2), {
      contentType: 'application/json',
      metadata: {
        updatedBy: req.user.username,
        updatedAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Page mise à jour avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la page ${req.params.pageId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour créer une nouvelle page
app.post('/pages', authenticate, async (req, res) => {
  try {
    const { pageContent, pageId, addToNavigation } = req.body;
    
    if (!pageId || !pageContent) {
      return res.status(400).json({ message: 'ID de page et contenu requis' });
    }
    
    // Vérifier si la page existe déjà
    const file = admin.storage().bucket().file(`ayurveda-cms-content/pages/${pageId}.json`);
    const [exists] = await file.exists();
    
    if (exists) {
      return res.status(409).json({ message: 'Une page avec cet ID existe déjà' });
    }
    
    // Créer le fichier de contenu de la page
    await file.save(JSON.stringify(pageContent, null, 2), {
      contentType: 'application/json',
      metadata: {
        createdBy: req.user.username,
        createdAt: new Date().toISOString()
      }
    });
    
    // Si demandé, ajouter la page à la navigation
    if (addToNavigation) {
      const structureFile = admin.storage().bucket().file('ayurveda-cms-content/structure.json');
      const [structureContent] = await structureFile.download();
      const structure = JSON.parse(structureContent.toString());
      
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
      await structureFile.save(JSON.stringify(structure, null, 2), {
        contentType: 'application/json',
        metadata: {
          updatedBy: req.user.username,
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    res.status(201).json({ message: 'Page créée avec succès', pageId });
  } catch (error) {
    console.error('Erreur lors de la création de la page:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour supprimer une page
app.delete('/pages/:pageId', authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Supprimer le fichier de contenu de la page
    const file = admin.storage().bucket().file(`ayurveda-cms-content/pages/${pageId}.json`);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ message: 'Page non trouvée' });
    }
    
    // Créer une sauvegarde avant suppression
    await createVersionSnapshot('pages', `${pageId}.json`);
    
    // Supprimer le fichier
    await file.delete();
    
    // Mettre à jour la structure du site pour retirer la page
    const structureFile = admin.storage().bucket().file('ayurveda-cms-content/structure.json');
    const [structureContent] = await structureFile.download();
    const structure = JSON.parse(structureContent.toString());
    
    // Retirer la page de la liste des pages
    structure.pages = structure.pages.filter(page => page.id !== pageId);
    
    // Retirer de toutes les navigations
    Object.keys(structure.navigation).forEach(navKey => {
      structure.navigation[navKey] = structure.navigation[navKey].filter(item => item.id !== pageId);
    });
    
    // Enregistrer la structure mise à jour
    await structureFile.save(JSON.stringify(structure, null, 2), {
      contentType: 'application/json',
      metadata: {
        updatedBy: req.user.username,
        updatedAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Page supprimée avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page ${req.params.pageId}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion des médias et ressources
app.post('/media/upload', authenticate, async (req, res) => {
  try {
    const { filename, fileContent, contentType, folder = 'images' } = req.body;
    
    if (!filename || !fileContent || !contentType) {
      return res.status(400).json({ message: 'Nom de fichier, contenu et type de contenu requis' });
    }
    
    // Créer un nom de fichier unique pour éviter les collisions
    const uniqueFileName = `${folder}/${uuidv4()}-${filename}`;
    
    // Convertir le contenu base64 en Buffer
    const fileBuffer = Buffer.from(fileContent.replace(/^data:[^;]+;base64,/, ''), 'base64');
    
    // Uploader le fichier
    const file = admin.storage().bucket().file(`ayurveda-cms-media/${uniqueFileName}`);
    await file.save(fileBuffer, {
      contentType,
      metadata: {
        uploadedBy: req.user.username,
        uploadedAt: new Date().toISOString(),
        originalName: filename
      },
      public: true // Rendre le fichier accessible publiquement
    });
    
    // Récupérer l'URL publique
    const [metadata] = await file.getMetadata();
    const publicUrl = metadata.mediaLink;
    
    res.status(201).json({ message: 'Fichier uploadé avec succès', filename: uniqueFileName, url: publicUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Liste des médias
app.get('/media', authenticate, async (req, res) => {
  try {
    const [files] = await admin.storage().bucket().getFiles({ prefix: 'ayurveda-cms-media/' });
    
    const mediaFiles = await Promise.all(files.map(async file => {
      const [metadata] = await file.getMetadata();
      
      return {
        name: file.name.replace('ayurveda-cms-media/', ''),
        url: metadata.mediaLink,
        contentType: metadata.contentType,
        size: metadata.size,
        uploadedAt: metadata.metadata?.uploadedAt || metadata.timeCreated,
        uploadedBy: metadata.metadata?.uploadedBy || 'unknown'
      };
    }));
    
    res.json(mediaFiles);
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Suppression d'un média
app.delete('/media/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const file = admin.storage().bucket().file(`ayurveda-cms-media/${decodeURIComponent(filename)}`);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    await file.delete();
    
    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier ${req.params.filename}:`, error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer les thèmes disponibles
app.get('/themes', authenticate, async (req, res) => {
  try {
    const [files] = await admin.storage().bucket().getFiles({ prefix: 'ayurveda-cms-content/themes/' });
    
    const themes = [];
    for (const file of files) {
      if (file.name.endsWith('theme.json')) {
        const [content] = await file.download();
        const theme = JSON.parse(content.toString());
        themes.push({
          id: file.name.replace('ayurveda-cms-content/themes/', '').replace('theme.json', ''),
          ...theme
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
app.get('/themes/active', authenticate, async (req, res) => {
  try {
    const file = admin.storage().bucket().file('ayurveda-cms-content/active-theme.json');
    const [exists] = await file.exists();
    
    if (!exists) {
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
    
    const [content] = await file.download();
    const activeTheme = JSON.parse(content.toString());
    
    res.json(activeTheme);
  } catch (error) {
    console.error('Erreur lors de la récupération du thème actif:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour mettre à jour le thème actif
app.put('/themes/active', authenticate, async (req, res) => {
  try {
    const theme = req.body;
    const file = admin.storage().bucket().file('ayurveda-cms-content/active-theme.json');
    
    // Créer un snapshot du thème actuel avant modification
    await createVersionSnapshot('', 'active-theme.json');
    
    // Enregistrer le nouveau thème actif
    await file.save(JSON.stringify(theme, null, 2), {
      contentType: 'application/json',
      metadata: {
        updatedBy: req.user.username,
        updatedAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Thème actif mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thème actif:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour créer un nouveau thème
app.post('/themes', authenticate, async (req, res) => {
  try {
    const { theme, id } = req.body;
    
    if (!id || !theme) {
      return res.status(400).json({ message: 'ID de thème et données requises' });
    }
    
    const file = admin.storage().bucket().file(`ayurveda-cms-content/themes/${id}-theme.json`);
    const [exists] = await file.exists();
    
    if (exists) {
      return res.status(409).json({ message: 'Un thème avec cet ID existe déjà' });
    }
    
    // Enregistrer le nouveau thème
    await file.save(JSON.stringify(theme, null, 2), {
      contentType: 'application/json',
      metadata: {
        createdBy: req.user.username,
        createdAt: new Date().toISOString()
      }
    });
    
    res.status(201).json({ message: 'Thème créé avec succès', id });
  } catch (error) {
    console.error('Erreur lors de la création du thème:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour générer le site statique
app.post('/publish', authenticate, async (req, res) => {
  try {
    // Lancer la génération du site statique
    await generateStaticSite();
    
    // Générer le sitemap
    await generateSitemap();
    
    // Enregistrer l'action de publication dans l'historique
    const publishLogFile = admin.storage().bucket().file(`ayurveda-cms-content/publish-log/publish-${new Date().toISOString()}.json`);
    await publishLogFile.save(JSON.stringify({
      publishedAt: new Date().toISOString(),
      publishedBy: req.user.username,
      status: 'success'
    }), {
      contentType: 'application/json'
    });
    
    res.json({ message: 'Site publié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la publication du site:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer l'historique des versions
app.get('/versions', authenticate, async (req, res) => {
  try {
    const [files] = await admin.storage().bucket().getFiles({ prefix: 'ayurveda-cms-content/versions/' });
    
    const versions = [];
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      
      versions.push({
        file: file.name.replace('ayurveda-cms-content/versions/', ''),
        timestamp: metadata.metadata?.timestamp || metadata.timeCreated,
        user: metadata.metadata?.user || 'unknown'
      });
    }
    
    // Trier par date de création (plus récente en premier)
    versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(versions);
  } catch (error) {
    console.error('Erreur lors de la récupération des versions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour restaurer une version
app.post('/versions/restore', authenticate, async (req, res) => {
  try {
    const { versionFile, targetFile } = req.body;
    
    if (!versionFile || !targetFile) {
      return res.status(400).json({ message: 'Fichier de version et fichier cible requis' });
    }
    
    const sourceFile = admin.storage().bucket().file(`ayurveda-cms-content/versions/${versionFile}`);
    const [exists] = await sourceFile.exists();
    
    if (!exists) {
      return res.status(404).json({ message: 'Version non trouvée' });
    }
    
    // Créer un snapshot de l'état actuel avant restauration
    const targetPath = targetFile.split('/');
    const targetDir = targetPath.slice(0, -1).join('/');
    const targetFileName = targetPath[targetPath.length - 1];
    await createVersionSnapshot(targetDir, targetFileName);
    
    // Copier le contenu de la version vers le fichier cible
    const [content] = await sourceFile.download();
    const destFile = admin.storage().bucket().file(`ayurveda-cms-content/${targetFile}`);
    
    await destFile.save(content, {
      contentType: 'application/json',
      metadata: {
        restoredFrom: versionFile,
        restoredBy: req.user.username,
        restoredAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Version restaurée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la restauration de la version:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// API pour récupérer les paramètres SMTP
app.get('/settings/smtp', authenticate, async (req, res) => {
  try {
    const file = admin.storage().bucket().file('ayurveda-cms-content/settings/smtp.json');
    const [exists] = await file.exists();
    
    if (!exists) {
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
    
    const [content] = await file.download();
    const smtpSettings = JSON.parse(content.toString());
    
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
app.put('/settings/smtp', authenticate, async (req, res) => {
  try {
    const smtpSettings = req.body;
    const file = admin.storage().bucket().file('ayurveda-cms-content/settings/smtp.json');
    const [exists] = await file.exists();
    
    // Si le fichier existe déjà et que le mot de passe est masqué, récupérer le mot de passe actuel
    if (exists && smtpSettings.auth?.pass === '********') {
      const [content] = await file.download();
      const currentSettings = JSON.parse(content.toString());
      
      if (currentSettings.auth?.pass) {
        smtpSettings.auth.pass = currentSettings.auth.pass;
      }
    }
    
    // Enregistrer les paramètres SMTP
    await file.save(JSON.stringify(smtpSettings, null, 2), {
      contentType: 'application/json',
      metadata: {
        updatedBy: req.user.username,
        updatedAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Paramètres SMTP mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres SMTP:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour créer un snapshot d'un fichier avant modification (versioning)
async function createVersionSnapshot(directory, filename) {
  try {
    const sourceFile = admin.storage().bucket().file(`ayurveda-cms-content/${directory ? directory + '/' : ''}${filename}`);
    const [exists] = await sourceFile.exists();
    
    if (!exists) {
      return; // Ne rien faire si le fichier n'existe pas
    }
    
    const [content] = await sourceFile.download();
    const [metadata] = await sourceFile.getMetadata();
    
    // Créer un nom de fichier unique pour la version
    const timestamp = new Date().toISOString();
    const versionFile = admin.storage().bucket().file(`ayurveda-cms-content/versions/${directory ? directory + '/' : ''}${filename}-${timestamp}`);
    
    // Enregistrer le snapshot avec les métadonnées
    await versionFile.save(content, {
      contentType: metadata.contentType,
      metadata: {
        sourceFile: `${directory ? directory + '/' : ''}${filename}`,
        timestamp,
        user: metadata.metadata?.updatedBy || 'system'
      }
    });
    
    return `versions/${directory ? directory + '/' : ''}${filename}-${timestamp}`;
  } catch (error) {
    console.error('Erreur lors de la création d\'un snapshot de version:', error);
    throw error;
  }
}

// Fonction pour initialiser le contenu par défaut (à appeler lors du premier déploiement)
async function initializeDefaultContent() {
  try {
    const bucket = admin.storage().bucket();
    
    // Vérifier si l'initialisation a déjà été effectuée
    const structureFile = bucket.file('ayurveda-cms-content/structure.json');
    const [exists] = await structureFile.exists();
    
    if (exists) {
      console.log('Contenu déjà initialisé, pas besoin de réinitialiser');
      return;
    }
    
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
    
    // Créer les fichiers par défaut
    await structureFile.save(JSON.stringify(defaultStructure, null, 2), {
      contentType: 'application/json'
    });
    
    const themeFile = bucket.file('ayurveda-cms-content/active-theme.json');
    await themeFile.save(JSON.stringify(defaultTheme, null, 2), {
      contentType: 'application/json'
    });
    
    console.log('Initialisation du contenu par défaut réussie');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du contenu par défaut:', error);
  }
}

// Exposer l'API Express pour Firebase Functions
exports.api = functions.https.onRequest(app);

// Fonction pour générer le site statique à la demande
exports.generateSite = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentification requise pour générer le site'
    );
  }
  
  try {
    await generateStaticSite();
    return { success: true, message: 'Site généré avec succès' };
  } catch (error) {
    console.error('Erreur lors de la génération du site:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la génération du site');
  }
});

// Fonction qui s'exécute lors du déploiement initial pour configurer le contenu par défaut
exports.setup = functions.https.onRequest(async (req, res) => {
  try {
    await initializeDefaultContent();
    res.status(200).send('Configuration initiale terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la configuration initiale:', error);
    res.status(500).send('Erreur lors de la configuration initiale');
  }
});

// Fonction qui s'exécute lorsqu'un fichier HTML est téléchargé pour l'extraire et le convertir
exports.processHtmlTemplate = functions.storage.object().onFinalize(async (object) => {
  // Vérifier si c'est un fichier HTML ajouté au dossier templates
  if (!object.name.startsWith('templates/') || !object.name.endsWith('.html')) {
    return;
  }
  
  try {
    // Télécharger le fichier HTML
    const bucket = admin.storage().bucket();
    const file = bucket.file(object.name);
    const [content] = await file.download();
    
    // Analyser le contenu HTML
    const pageStructure = parseHtmlPage(content.toString());
    
    // Sauvegarder la structure dans un fichier JSON
    const jsonFileName = object.name.replace('.html', '.json');
    const jsonFile = bucket.file(jsonFileName);
    
    await jsonFile.save(JSON.stringify(pageStructure, null, 2), {
      contentType: 'application/json',
      metadata: {
        source: object.name,
        processedAt: new Date().toISOString()
      }
    });
    
    console.log(`Fichier HTML ${object.name} traité et converti en ${jsonFileName}`);
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier HTML ${object.name}:`, error);
  }
});