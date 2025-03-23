const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Charger les modèles
const User = require('./models/user');
const Page = require('./models/page');
const Block = require('./models/block');
const Theme = require('./models/theme');
const Settings = require('./models/settings');

// Connexion à la base de données
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Créer des données initiales
const createInitialData = async () => {
  try {
    // Nettoyer la base de données
    await User.deleteMany();
    await Page.deleteMany();
    await Block.deleteMany();
    await Theme.deleteMany();
    await Settings.deleteMany();

    console.log('Base de données nettoyée'.red.inverse);

    // Créer un utilisateur admin
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('Utilisateur admin créé'.green);

    // Créer un thème par défaut
    const defaultTheme = await Theme.create({
      name: 'Thème par défaut',
      description: 'Thème par défaut du MiniCMS',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      fonts: {
        heading: 'Poppins, sans-serif',
        body: 'Inter, sans-serif'
      },
      customCSS: `/* Variables */
:root {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --color-background: #FFFFFF;
  --color-text: #1F2937;
  --font-heading: Poppins, sans-serif;
  --font-body: Inter, sans-serif;
}

/* Base styles */
body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.accent {
  color: var(--color-accent);
}`,
      isActive: true,
      createdBy: adminUser._id
    });

    console.log('Thème par défaut créé'.green);

    // Créer les blocs pour la page d'accueil
    const homeHeroBlock = await Block.create({
      type: 'text',
      name: 'Titre de la page d\'accueil',
      content: '<h1>Bienvenue sur votre site</h1><p>Ceci est un exemple de site créé avec MiniCMS, une solution légère et flexible pour gérer votre contenu web.</p>',
      styles: {
        padding: '20px',
        textAlign: 'center'
      },
      animation: 'fade-in',
      position: {
        x: 0,
        y: 0,
        width: 12,
        height: 2
      },
      order: 0,
      isVisible: true
    });

    const homeFeaturesBlock = await Block.create({
      type: 'text',
      name: 'Fonctionnalités',
      content: '<h2>Nos fonctionnalités</h2><div class="features-grid"><div class="feature"><h3>Simple</h3><p>Interface intuitive pour gérer votre contenu sans connaissance technique.</p></div><div class="feature"><h3>Flexible</h3><p>Adaptez chaque page selon vos besoins avec notre éditeur visuel.</p></div><div class="feature"><h3>Rapide</h3><p>Sites statiques optimisés pour des performances maximales.</p></div></div>',
      styles: {
        padding: '40px 20px',
        backgroundColor: '#f9fafb'
      },
      animation: 'slide-in-left',
      position: {
        x: 0,
        y: 2,
        width: 12,
        height: 4
      },
      order: 1,
      isVisible: true
    });

    const homeImageBlock = await Block.create({
      type: 'image',
      name: 'Image principale',
      content: {
        src: '/assets/images/default-hero.jpg',
        alt: 'Image de démonstration'
      },
      styles: {
        margin: '20px auto',
        maxWidth: '100%',
        borderRadius: '8px'
      },
      animation: 'zoom-in',
      position: {
        x: 2,
        y: 6,
        width: 8,
        height: 3
      },
      order: 2,
      isVisible: true
    });

    const homeCtaBlock = await Block.create({
      type: 'text',
      name: 'Appel à l\'action',
      content: '<div class="cta-container"><h2>Prêt à commencer ?</h2><p>Créez votre site maintenant et partagez votre contenu avec le monde.</p><a href="/contact.html" class="btn btn-primary">Nous contacter</a></div>',
      styles: {
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      },
      animation: 'slide-in-bottom',
      position: {
        x: 0,
        y: 9,
        width: 12,
        height: 3
      },
      order: 3,
      isVisible: true
    });

    console.log('Blocs créés'.green);

    // Créer la page d'accueil
    const homePage = await Page.create({
      title: 'Accueil',
      slug: 'index',
      description: 'Page d\'accueil du site',
      template: 'default',
      blocks: [
        homeHeroBlock._id,
        homeFeaturesBlock._id,
        homeImageBlock._id,
        homeCtaBlock._id
      ],
      meta: {
        title: 'Accueil | MiniCMS',
        description: 'Bienvenue sur notre site créé avec MiniCMS',
        keywords: 'minicms, site web, gestion de contenu'
      },
      isPublished: true,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    });

    console.log('Page d\'accueil créée'.green);

    // Créer les paramètres du site
    const siteSettings = await Settings.create({
      siteTitle: 'Mon Site MiniCMS',
      siteDescription: 'Un site web créé avec MiniCMS',
      favicon: '/assets/images/favicon.ico',
      logo: '/assets/images/logo.png',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'user@example.com',
        pass: 'password'
      },
      socialMedia: {
        facebook: 'https://facebook.com/monsite',
        twitter: 'https://twitter.com/monsite',
        instagram: 'https://instagram.com/monsite',
        linkedin: 'https://linkedin.com/company/monsite'
      },
      deploymentSettings: {
        provider: 'none',
        config: {}
      },
      updatedBy: adminUser._id
    });

    console.log('Paramètres du site créés'.green);

    console.log('Données initiales créées avec succès'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Appel de la fonction
createInitialData();
