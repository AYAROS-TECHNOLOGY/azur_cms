'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Chemin de stockage des utilisateurs (fichier JSON)
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Paramètres
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_robuste';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 12;

// Fonction utilitaire : lecture des utilisateurs
async function getUsers() {
  if (!(await fs.pathExists(USERS_FILE))) {
    await fs.writeJson(USERS_FILE, []);
  }
  return fs.readJson(USERS_FILE);
}

// Fonction utilitaire : sauvegarde des utilisateurs
async function saveUsers(users) {
  return fs.writeJson(USERS_FILE, users, { spaces: 2 });
}

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Inscription d’un nouvel utilisateur
 *     tags:
 *       - Authentification
 *     requestBody:
 *       description: Données d’inscription (email et mot de passe)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Utilisateur inscrit avec succès
 *       400:
 *         description: Validation échouée ou utilisateur existant
 */
router.post(
  '/signup',
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      let users = await getUsers();
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Utilisateur existant' });
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = {
        id: Date.now(),
        email,
        password: hashedPassword,
        createdAt: new Date()
      };
      users.push(newUser);
      await saveUsers(users);
      res.json({ message: 'Utilisateur inscrit avec succès' });
    } catch (error) {
      console.error('Erreur lors de l’inscription :', error);
      res.status(500).json({ error: 'Erreur serveur lors de l’inscription' });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d’un utilisateur
 *     tags:
 *       - Authentification
 *     requestBody:
 *       description: Données de connexion (email et mot de passe)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie et token JWT retourné
 *       401:
 *         description: Identifiants invalides
 */
router.post(
  '/login',
  body('email').isEmail().withMessage('Email invalide'),
  body('password').exists().withMessage('Le mot de passe est requis'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const users = await getUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token });
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
  }
);

module.exports = router;
