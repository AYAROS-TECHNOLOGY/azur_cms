const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/error');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialiser l'application Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/pages', require('./routes/pages.js'));
app.use('/api/blocks', require('./routes/blocks.js'));
app.use('/api/media', require('./routes/media.js'));
app.use('/api/themes', require('./routes/themes.js'));
app.use('/api/settings', require('./routes/settings.js'));
app.use('/api/versions', require('./routes/versions.js'));
app.use('/api/deploy', require('./routes/deploy.js'));

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gérer les arrêts non gérés
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erreur: ${err.message}`);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});