ayurveda-cms/
├── client/                   # Interface d'administration (React)
│   ├── public/               # Fichiers statiques
│   └── src/                  # Code source React
│       ├── components/       # Composants réutilisables
│       │   ├── editors/      # Éditeurs de contenu (visuel, texte riche)
│       │   ├── layout/       # Composants de mise en page
│       │   ├── media/        # Composants de gestion des médias
│       │   ├── preview/      # Composants de prévisualisation
│       │   └── ui/           # Composants d'interface utilisateur
│       ├── contexts/         # Contextes React (auth, alertes)
│       ├── pages/            # Pages principales de l'application
│       ├── services/         # Services (API, helpers)
│       ├── App.jsx           # Composant principal
│       └── index.jsx         # Point d'entrée React
│
├── functions/                # Fonctions serverless (backend)
│   ├── src/
│   │   ├── api/              # Endpoints API
│   │   ├── generators/       # Générateurs de site statique
│   │   ├── utils/            # Utilitaires (parsing HTML, stockage)
│   │   └── index.js          # Point d'entrée des fonctions
│   └── package.json          # Dépendances des fonctions
│
├── server/                   # Serveur de développement local
│   ├── data/                 # Données locales pour développement
│   │   ├── pages/            # Contenu des pages
│   │   ├── themes/           # Thèmes du site
│   │   ├── versions/         # Historique des versions
│   │   ├── settings/         # Paramètres du site
│   │   └── media/            # Médias téléchargés
│   ├── local-server.js       # Serveur Express pour développement
│   └── init-content.js       # Script d'initialisation du contenu
│
├── src/
│   └── templates/            # Templates HTML originaux
│       └── original-template.html  # Site original à convertir
│
├── firebase.json             # Configuration Firebase
├── storage.rules             # Règles de sécurité du stockage
└── package.json              # Dépendances et scripts principaux