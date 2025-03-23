minicms/
├── admin-app/                   # Frontend React pour le back-office
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── pageEditor/
│   │   │   ├── mediaLibrary/
│   │   │   ├── themeEditor/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
│
├── api/                         # Backend Serverless API
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── pages.js
│   │   ├── media.js
│   │   ├── themes.js
│   │   ├── deploy.js
│   │   └── settings.js
│   ├── models/
│   │   ├── user.js
│   │   ├── page.js
│   │   ├── pageTemplate.js
│   │   ├── block.js
│   │   ├── media.js
│   │   ├── theme.js
│   │   └── version.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── utils/
│   │   ├── generator.js
│   │   ├── deployer.js
│   │   └── versioning.js
│   ├── server.js
│   └── package.json
│
├── generator/                   # Générateur de site statique
│   ├── templates/
│   ├── themes/
│   ├── generator.js
│   └── package.json
│
└── .env                         # Variables d'environnement