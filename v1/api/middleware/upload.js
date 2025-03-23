const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Configurer le stockage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.env.FILE_UPLOAD_PATH || 'uploads/');
  },
  filename: function(req, file, cb) {
    // Créer un nom de fichier unique
    cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
  }
});

// Filtrer les fichiers
const fileFilter = (req, file, cb) => {
  // Types de fichiers autorisés
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/json'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse(`Type de fichier non pris en charge: ${file.mimetype}`, 400), false);
  }
};

// Configurer multer
exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB par défaut
  }
});