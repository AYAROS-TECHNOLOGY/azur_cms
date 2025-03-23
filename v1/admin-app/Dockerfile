FROM node:16-alpine

WORKDIR /usr/src/app

# Copier les fichiers de package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
