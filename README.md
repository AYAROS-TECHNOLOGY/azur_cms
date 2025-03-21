# Ayurveda Équilibre CMS

Un système de gestion de contenu (CMS) léger et serverless pour le site Ayurveda Équilibre, permettant de modifier facilement le site web sans connaissances en programmation.

## Fonctionnalités

- **Éditeur visuel** pour modifier facilement le contenu des pages
- **Gestionnaire de médias** pour télécharger et organiser les images
- **Éditeur de thème** pour personnaliser les couleurs et polices
- **Gestion des versions** pour suivre les modifications
- **Déploiement serverless** pour une solution scalable et économique

## Prérequis

- Node.js v16 ou supérieur
- npm v7 ou supérieur
- Un compte Firebase (gratuit) pour le déploiement serverless

## Installation

### Installation locale

1. **Cloner le dépôt**
   ```
   git clone https://github.com/votre-utilisateur/ayurveda-cms.git
   cd ayurveda-cms
   ```

2. **Exécuter le script d'installation**
   ```
   node setup.js
   ```
   
   Le script d'installation va :
   - Vérifier que tous les répertoires nécessaires existent
   - Vous demander de fournir le chemin du template HTML original
   - Initialiser les données du CMS à partir du template
   - Installer toutes les dépendances

3. **Démarrer le serveur de développement**
   ```
   npm start
   ```

4. **Accéder au CMS**
   Ouvrez votre navigateur à l'adresse `http://localhost:3000`
   - Utilisateur : `admin`
   - Mot de passe : `admin123`

### Déploiement serverless sur Firebase

1. **Installer Firebase CLI**
   ```
   npm install -g firebase-tools
   ```

2. **Se connecter à Firebase**
   ```
   firebase login
   ```

3. **Initialiser le projet Firebase**
   ```
   firebase init
   ```
   Sélectionnez les options suivantes :
   - Functions (pour le backend serverless)
   - Hosting (pour le front-end)
   - Storage (pour les médias et données)

4. **Configurer les variables d'environnement**
   ```
   cd functions
   cp .env.example .env
   ```
   Modifiez le fichier `.env` avec vos paramètres.

5. **Construire le projet**
   ```
   npm run build
   ```

6. **Déployer sur Firebase**
   ```
   npm run deploy
   ```

## Guide d'utilisation

### Gestion des pages

1. Cliquez sur "Pages" dans le menu latéral
2. Pour créer une nouvelle page, cliquez sur "Nouvelle page"
3. Pour modifier une page existante, cliquez sur son nom dans la liste

### Éditeur visuel

L'éditeur visuel permet de modifier facilement le contenu sans connaître le code :

1. **Ajouter un élément** : Cliquez sur "Ajouter un élément" dans une section
2. **Modifier un élément** : Cliquez sur l'icône de crayon sur un élément
3. **Déplacer un élément** : Faites glisser l'élément à l'emplacement souhaité
4. **Supprimer un élément** : Cliquez sur l'icône de corbeille sur un élément

### Gestion des médias

1. Cliquez sur "Médias" dans le menu latéral
2. Pour télécharger des médias, cliquez sur "Télécharger"
3. Pour utiliser un média, sélectionnez-le dans le gestionnaire de médias

### Personnalisation du thème

1. Cliquez sur "Thème" dans le menu latéral
2. Modifiez les couleurs et polices à l'aide des outils fournis
3. Cliquez sur "Enregistrer" pour appliquer les modifications

### Publication du site

Après avoir effectué vos modifications, cliquez sur "Publier" en haut à droite pour générer le site statique.

## Structure du projet

```
ayurveda-cms/
├── client/                   # Interface d'administration (React)
├── functions/                # Fonctions serverless (backend)
├── server/                   # Serveur de développement local
├── src/                      # Fichiers sources partagés
├── firebase.json             # Configuration Firebase
└── package.json              # Dépendances et scripts
```

## Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

Pour toute question ou suggestion, veuillez ouvrir une issue sur GitHub.