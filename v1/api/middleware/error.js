const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log pour le débogage
  console.error(err);
  
  // Erreur de Mongoose - ID invalide
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  
  // Erreur de Mongoose - Duplication
  if (err.code === 11000) {
    const message = 'Valeur en doublon';
    error = new ErrorResponse(message, 400);
  }
  
  // Erreur de Mongoose - Validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur du serveur'
  });
};

module.exports = errorHandler;