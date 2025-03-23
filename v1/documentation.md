# Documentation de l'API MiniCMS

## Introduction

L'API MiniCMS est une interface RESTful qui permet de gérer le contenu d'un site web statique. Cette API expose des endpoints pour gérer les utilisateurs, les pages, les blocs de contenu, les médias, les thèmes et les paramètres du site, ainsi que pour gérer le déploiement du site.

Base URL: `http://localhost:5000/api`

## Authentification

L'API utilise l'authentification par JWT (JSON Web Token). Pour accéder aux routes protégées, vous devez inclure le token dans l'en-tête HTTP de vos requêtes.

### Obtenir un token

```
POST /auth/login
```

Paramètres de la requête :

| Nom       | Type   | Description      |
|-----------|--------|------------------|
| email     | string | Email utilisateur|
| password  | string | Mot de passe     |

Exemple de requête :

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Exemple de réponse :

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Utiliser le token

Incluez le token dans l'en-tête HTTP de toutes vos requêtes aux routes protégées :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Routes utilisateurs

### S'inscrire

```
POST /auth/register
```

Paramètres de la requête :

| Nom       | Type   | Description             |
|-----------|--------|-------------------------|
| name      | string | Nom complet             |
| email     | string | Email (unique)          |
| password  | string | Mot de passe (min 6 car)|
| role      | string | Rôle (admin ou editor)  |

Exemple de requête :

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123",
  "role": "editor"
}
```

### Récupérer l'utilisateur courant

```
GET /auth/me
```

Exemple de réponse :

```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9af3b5be2e6c5118b4",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "editor",
    "createdAt": "2023-06-25T12:00:00.000Z"
  }
}
```

### Mettre à jour l'utilisateur

```
PUT /auth/me
```

Paramètres de la requête :

| Nom       | Type   | Description    |
|-----------|--------|----------------|
| name      | string | Nouveau nom    |
| email     | string | Nouvel email   |

Exemple de requête :

```json
{
  "name": "Jean Martin",
  "email": "jean.martin@example.com"
}
```

## Routes des pages

### Récupérer toutes les pages

```
GET /pages
```

Exemple de réponse :

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec9af3b5be2e6c5118b5",
      "title": "Accueil",
      "slug": "index",
      "description": "Page d'accueil du site",
      "template": "default",
      "isPublished": true,
      "createdAt": "2023-06-25T12:00:00.000Z",
      "updatedAt": "2023-06-25T12:00:00.000Z"
    },
    {
      "_id": "60d5ec9af3b5be2e6c5118b6",
      "title": "À propos",
      "slug": "a-propos",
      "description": "Page à propos",
      "template": "default",
      "isPublished": false,
      "createdAt": "2023-06-25T12:00:00.000Z",
      "updatedAt": "2023-06-25T12:00:00.000Z"
    }
  ]
}
```

### Récupérer une page spécifique

```
GET /pages/:id
```

Exemple de réponse :

```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9af3b5be2e6c5118b5",
    "title": "Accueil",
    "slug": "index",
    "description": "Page d'accueil du site",
    "template": "default",
    "blocks": [
      {
        "_id": "60d5ec9af3b5be2e6c5118c1",
        "type": "text",
        "name": "Titre de la page d'accueil",
        "content": "<h1>Bienvenue sur votre site</h1><p>Ceci est un exemple de site créé avec MiniCMS...</p>",
        "styles": {
          "padding": "20px",
          "textAlign": "center"
        },
        "animation": "fade-in",
        "position": {
          "x": 0,
          "y": 0,
          "width": 12,
          "height": 2
        },
        "order": 0,
        "isVisible": true
      },
      // Autres blocs...
    ],
    "meta": {
      "title": "Accueil | MiniCMS",
      "description": "Bienvenue sur notre site créé avec MiniCMS",
      "keywords": "minicms, site web, gestion de contenu"
    },
    "isPublished": true,
    "createdBy": "60d5ec9af3b5be2e6c5118b4",
    "updatedBy": "60d5ec9af3b5be2e6c5118b4",
    "createdAt": "2023-06-25T12:00:00.000Z",
    "updatedAt": "2023-06-25T12:00:00.000Z"
  }
}
```

### Créer une page

```
POST /pages
```

Paramètres de la requête :

| Nom         | Type    | Description                             |
|-------------|--------|-----------------------------------------|
| title       | string | Titre de la page                         |
| slug        | string | Slug URL (optionnel, généré depuis title)|
| description | string | Description de la page (optionnel)        |
| template    | string | Nom du template (optionnel, défaut: default)|
| meta        | object | Métadonnées SEO (optionnel)              |
| blocks      | array  | IDs des blocs (optionnel)                |
| isPublished | boolean| Statut de publication (défaut: false)    |

Exemple de requête :

```json
{
  "title": "Nos services",
  "description": "Découvrez nos services professionnels",
  "template": "default",
  "meta": {
    "title": "Services professionnels | MiniCMS",
    "description": "Découvrez notre gamme de services professionnels",
    "keywords": "services, professionnels, expertise"
  },
  "isPublished": false
}
```

### Mettre à jour une page

```
PUT /pages/:id
```

Paramètres de la requête : mêmes que pour la création.

### Supprimer une page

```
DELETE /pages/:id
```

Exemple de réponse :

```json
{
  "success": true,
  "data": {}
}
```

### Publier une page

```
PUT /pages/:id/publish
```

Exemple de réponse :

```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9af3b5be2e6c5118b6",
    "title": "À propos",
    "isPublished": true,
    // Autres champs...
  }
}
```

### Dupliquer une page

```
POST /pages/:id/duplicate
```

Exemple de réponse :

```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9af3b5be2e6c5118b7",
    "title": "À propos (copie)",
    "slug": "a-propos-copy",
    // Autres champs...
  }
}
```

## Routes des blocs

### Récupérer tous les blocs

```
GET /blocks
```

Paramètres optionnels de requête :

| Nom   | Type   | Description                    |
|-------|--------|--------------------------------|
| page  | string | Filtrer par ID de page         |

### Récupérer un bloc spécifique

```
GET /blocks/:id
```

### Créer un bloc

```
POST /blocks
```

Paramètres de la requête :

| Nom        | Type    | Description                       |
|------------|---------|-----------------------------------|
| type       | string  | Type de bloc (text, image, video...)|
| name       | string  | Nom du bloc                        |
| content    | mixed   | Contenu du bloc (dépend du type)    |
| styles     | object  | Styles CSS (optionnel)             |
| animation  | string  | Animation (optionnel)              |
| position   | object  | Position dans la grille            |
| order      | number  | Ordre d'affichage (optionnel)      |
| isVisible  | boolean | Visibilité (défaut: true)          |
| pageId     | string  | ID de la page associée (optionnel) |

Exemple de requête pour un bloc de texte :

```json
{
  "type": "text",
  "name": "Introduction",
  "content": "<h2>Bienvenue</h2><p>Ceci est un paragraphe d'introduction.</p>",
  "styles": {
    "padding": "20px",
    "backgroundColor": "#f9f9f9"
  },
  "animation": "fade-in",
  "position": {
    "x": 0,
    "y": 0,
    "width": 12,
    "height": 2
  },
  "order": 0,
  "pageId": "60d5ec9af3b5be2e6c5118b6"
}
```

Exemple de requête pour un bloc d'image :

```json
{
  "type": "image",
  "name": "Image principale",
  "content": {
    "src": "/uploads/1624636800000_image.jpg",
    "alt": "Description de l'image"
  },
  "styles": {
    "borderRadius": "8px"
  },
  "animation": "zoom-in",
  "position": {
    "x": 0,
    "y": 2,
    "width": 6,
    "height": 3
  },
  "order": 1,
  "pageId": "60d5ec9af3b5be2e6c5118b6"
}
```

### Mettre à jour un bloc

```
PUT /blocks/:id
```

Paramètres de la requête : mêmes que pour la création.

### Supprimer un bloc

```
DELETE /blocks/:id
```

Paramètres optionnels de requête :

| Nom     | Type   | Description                         |
|---------|--------|-------------------------------------|
| pageId  | string | ID de la page pour mettre à jour les références |

### Mettre à jour la position d'un bloc

```
PUT /blocks/:id/position
```

Paramètres de la requête :

| Nom        | Type    | Description                         |
|------------|---------|-------------------------------------|
| position   | object  | Position (x, y, width, height)      |
| pageId     | string  | ID de la page (optionnel)           |

Exemple de requête :

```json
{
  "position": {
    "x": 0,
    "y": 3,
    "width": 12,
    "height": 2
  },
  "pageId": "60d5ec9af3b5be2e6c5118b6"
}
```

## Routes des médias

### Récupérer tous les médias

```
GET /media
```

### Récupérer un média spécifique

```
GET /media/:id
```

### Télécharger un média

```
POST /media
```

Cette requête doit être envoyée en tant que `multipart/form-data`.

Paramètres de la requête :

| Nom   | Type   | Description                 |
|-------|--------|-----------------------------|
| file  | file   | Fichier à télécharger       |

### Mettre à jour un média

```
PUT /media/:id
```

Paramètres de la requête :

| Nom   | Type   | Description               |
|-------|--------|---------------------------|
| name  | string | Nouveau nom du fichier    |
| alt   | string | Texte alternatif (images) |

### Supprimer un média

```
DELETE /media/:id
```

### Redimensionner une image

```
POST /media/:id/resize
```

Paramètres de la requête :

| Nom     | Type   | Description                |
|---------|--------|----------------------------|
| width   | number | Nouvelle largeur (pixels)  |
| height  | number | Nouvelle hauteur (pixels)  |

Exemple de requête :

```json
{
  "width": 800,
  "height": 600
}
```

## Routes des thèmes

### Récupérer tous les thèmes

```
GET /themes
```

### Récupérer un thème spécifique

```
GET /themes/:id
```

### Créer un thème

```
POST /themes
```

Paramètres de la requête :

| Nom        | Type    | Description                |
|------------|---------|----------------------------|
| name       | string  | Nom du thème               |
| description| string  | Description (optionnel)    |
| colors     | object  | Couleurs du thème          |
| fonts      | object  | Polices du thème           |
| customCSS  | string  | CSS personnalisé           |
| isActive   | boolean | Thème actif (défaut: false)|

Exemple de requête :

```json
{
  "name": "Thème sombre",
  "description": "Un thème avec fond sombre",
  "colors": {
    "primary": "#6C63FF",
    "secondary": "#FF6584",
    "accent": "#FFC107",
    "background": "#121212",
    "text": "#FFFFFF"
  },
  "fonts": {
    "heading": "Montserrat, sans-serif",
    "body": "Open Sans, sans-serif"
  },
  "customCSS": "/* Styles personnalisés */\nbody { line-height: 1.6; }"
}
```

### Mettre à jour un thème

```
PUT /themes/:id
```

Paramètres de la requête : mêmes que pour la création.

### Supprimer un thème

```
DELETE /themes/:id
```

### Activer un thème

```
PUT /themes/:id/activate
```

### Exporter un thème

```
GET /themes/:id/export
```

Cette requête renvoie un fichier JSON à télécharger.

### Importer un thème

```
POST /themes/import
```

Cette requête doit être envoyée en tant que `multipart/form-data`.

Paramètres de la requête :

| Nom   | Type   | Description             |
|-------|--------|-------------------------|
| file  | file   | Fichier JSON du thème   |

## Routes des paramètres

### Récupérer les paramètres du site

```
GET /settings
```

### Mettre à jour les paramètres du site

```
PUT /settings
```

Paramètres de la requête :

| Nom              | Type    | Description                        |
|------------------|---------|------------------------------------|
| siteTitle        | string  | Titre du site                      |
| siteDescription  | string  | Description du site                |
| favicon          | string  | URL du favicon                     |
| logo             | string  | URL du logo                        |
| socialMedia      | object  | Liens vers les réseaux sociaux     |
| deploymentSettings | object  | Paramètres de déploiement        |

Exemple de requête :

```json
{
  "siteTitle": "Mon Site Web",
  "siteDescription": "Un site créé avec MiniCMS",
  "favicon": "/uploads/favicon.ico",
  "logo": "/uploads/logo.png",
  "socialMedia": {
    "facebook": "https://facebook.com/monsite",
    "twitter": "https://twitter.com/monsite",
    "instagram": "https://instagram.com/monsite",
    "linkedin": "https://linkedin.com/company/monsite"
  }
}
```

### Mettre à jour les paramètres SMTP

```
PUT /settings/smtp
```

Paramètres de la requête :

| Nom     | Type    | Description                    |
|---------|---------|--------------------------------|
| host    | string  | Hôte SMTP                      |
| port    | number  | Port SMTP                      |
| secure  | boolean | Utiliser SSL/TLS               |
| user    | string  | Nom d'utilisateur (optionnel)  |
| pass    | string  | Mot de passe (optionnel)       |

Exemple de requête :

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "user": "user@example.com",
  "pass": "password"
}
```

## Routes des versions

### Récupérer les versions d'une entité

```
GET /versions/:entityType/:entityId
```

Paramètres de l'URL :

| Nom         | Type   | Description                          |
|-------------|--------|--------------------------------------|
| entityType  | string | Type d'entité (page, theme, settings)|
| entityId    | string | ID de l'entité                       |

### Récupérer une version spécifique

```
GET /versions/:id
```

### Créer une version

```
POST /versions
```

Paramètres de la requête :

| Nom         | Type   | Description                          |
|-------------|--------|--------------------------------------|
| entityType  | string | Type d'entité (page, theme, settings)|
| entityId    | string | ID de l'entité                       |
| data        | object | Données de la version (optionnel)    |
| comment     | string | Commentaire (optionnel)              |

### Restaurer une version

```
POST /versions/:id/restore
```

## Routes de déploiement

### Déployer sur AWS

```
POST /deploy/aws
```

### Déployer sur Azure

```
POST /deploy/azure
```

### Déployer sur Netlify

```
POST /deploy/netlify
```

### Récupérer l'historique des déploiements

```
GET /deploy/history
```

### Récupérer le statut d'un déploiement

```
GET /deploy/status/:id
```

## Codes d'erreur

| Code | Description                      |
|------|----------------------------------|
| 400  | Requête incorrecte               |
| 401  | Non authentifié                  |
| 403  | Non autorisé                     |
| 404  | Ressource non trouvée            |
| 500  | Erreur serveur                   |

## Pagination

Par défaut, les routes qui renvoient des listes (comme `/pages` ou `/media`) ne sont pas paginées. Pour activer la pagination, ajoutez les paramètres suivants à la requête :

| Nom    | Type   | Description                     |
|--------|--------|---------------------------------|
| page   | number | Numéro de page (défaut: 1)      |
| limit  | number | Nombre d'éléments (défaut: 10)  |

Exemple : `/api/media?page=2&limit=20`

La réponse inclura alors des métadonnées de pagination :

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalPages": 3,
    "totalCount": 55
  },
  "data": [...]
}
```

## Filtrage

Certaines routes supportent le filtrage par des champs spécifiques. Par exemple :

- `/api/pages?isPublished=true` - Seulement les pages publiées
- `/api/media?type=image` - Seulement les images
- `/api/blocks?page=60d5ec9af3b5be2e6c5118b5` - Blocs d'une page spécifique

## Tri

Pour trier les résultats, utilisez le paramètre `sort` :

- `/api/pages?sort=title` - Tri par titre (ascendant)
- `/api/pages?sort=-updatedAt` - Tri par date de mise à jour (descendant)
- `/api/blocks?sort=order` - Tri par ordre (ascendant)

## Gestion des erreurs

Toutes les erreurs renvoient une réponse JSON avec la structure suivante :

```json
{
  "success": false,
  "error": "Message d'erreur"
}
```