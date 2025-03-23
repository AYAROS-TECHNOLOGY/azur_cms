'use strict';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_robuste';

/**
 * Middleware pour vérifier la validité d'un token JWT.
 * Utilisez-le pour protéger vos routes sensibles.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format attendu: "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès manquant' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
