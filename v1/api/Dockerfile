FROM node:16-alpine

WORKDIR /usr/src/app

# Copier les fichiers de package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Créer les répertoires nécessaires
RUN mkdir -p uploads temp build

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]
