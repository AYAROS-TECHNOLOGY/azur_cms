mon-mini-cms/
├── back-office/
│   ├── package.json
│   ├── server.js            (Serveur Node/Express pour l’API d’admin)
│   ├── data/
│   │   ├── pages/
│   │   │   └── home.json    (exemple de contenu pour la page d’accueil)
│   │   ├── blog/
│   │   │   └── 2023-03-21-hello-world.json
│   │   └── versions/
│   │       └── (historique des modifications)
│   ├── public/
│   │   └── admin-dist/      (build du front React/Vue pour l’admin)
│   ├── src/
│   │   ├── admin-frontend/  (code source React/Vue)
│   │   ├── package.json
        ├── public/ (icônes, index.html, etc.)
        ├── src/
        │   ├── App.js
        │   ├── components/
        │   └── ...
        └── ...
│   └── ...
├── site/
│   ├── index.html           (Site statique principal)
│   ├── css/
│   │   └── style.css
│   ├── images/
│   │   └── ...
│   ├── js/
│   │   └── ...
│   └── themes/
│       ├── default/
│       │   └── theme.css
│       └── custom-theme/
│           └── theme.css
└── README.md
