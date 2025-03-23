'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

// Sécurisation et middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));

// Chargement de la documentation Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Définition des chemins de stockage
const DATA_DIR = path.join(__dirname, 'data');
const PAGES_DIR = path.join(DATA_DIR, 'pages');
const BLOG_DIR = path.join(DATA_DIR, 'blog');
const VERSIONS_DIR = path.join(DATA_DIR, 'versions');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const ADMIN_DIST = path.join(__dirname, 'public', 'admin-dist');


//Configuration des routes
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/authMiddleware');
const templateRoutes = require('./routes/template');
const builderRoutes = require('./routes/builder');

//middleware
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Accès autorisé à la zone protégée', user: req.user });
});

// Création des répertoires nécessaires
[DATA_DIR, PAGES_DIR, BLOG_DIR, VERSIONS_DIR, UPLOADS_DIR].forEach(dir => {
  fs.ensureDirSync(dir);
});

app.use('/api/template', templateRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/builder', builderRoutes);

// Publication du front‑admin compilé
app.use('/admin', express.static(ADMIN_DIST));


app.get('/api/pages', async (req, res) => {
  try {
    const files = await fs.readdir(PAGES_DIR);
    const pages = await Promise.all(
      files.filter(file => file.endsWith('.json')).map(async file => {
        return await fs.readJson(path.join(PAGES_DIR, file));
      })
    );
    res.json(pages);
  } catch (error) {
    console.error('Error reading pages:', error);
    res.status(500).json({ error: 'Error reading pages.' });
  }
});


app.get('/api/pages/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    if (await fs.pathExists(filePath)) {
      const content = await fs.readJson(filePath);
      res.json(content);
    } else {
      res.status(404).json({ error: 'Page not found.' });
    }
  } catch (error) {
    console.error('Error reading page:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/pages/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    const newContent = req.body;

    // Sauvegarde de l'ancienne version
    if (await fs.pathExists(filePath)) {
      const oldContent = await fs.readJson(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(VERSIONS_DIR, `${slug}-${timestamp}.json`);
      await fs.writeJson(backupPath, oldContent, { spaces: 2 });
    }
    await fs.writeJson(filePath, newContent, { spaces: 2 });
    res.json({ message: 'Page saved successfully.' });
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: 'Error saving page.' });
  }
});

/**
 * @swagger

 */
app.delete('/api/pages/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      res.json({ message: 'Page deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Page not found.' });
    }
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Error deleting page.' });
  }
});


app.get('/api/blog', async (req, res) => {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const articles = await Promise.all(
      files.filter(file => file.endsWith('.json')).map(async file => {
        return await fs.readJson(path.join(BLOG_DIR, file));
      })
    );
    res.json(articles);
  } catch (error) {
    console.error('Error reading blog articles:', error);
    res.status(500).json({ error: 'Error reading blog articles.' });
  }
});


const upload = multer({ dest: UPLOADS_DIR });
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({
      message: 'File uploaded successfully.',
      filename: req.file.filename,
      originalname: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'File upload error.' });
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Production back-office CMS running on port ${PORT}`);
});
