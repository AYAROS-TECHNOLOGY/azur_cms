const Version = require('../models/version');
const Page = require('../models/page');
const Theme = require('../models/theme');
const Settings = require('../models/settings');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer les versions d'une entité
// @route   GET /api/versions/:entityType/:entityId
// @access  Private
exports.getVersions = asyncHandler(async (req, res, next) => {
  const { entityType, entityId } = req.params;

  // Valider le type d'entité
  if (!['page', 'theme', 'settings'].includes(entityType)) {
    return next(new ErrorResponse('Type d\'entité invalide', 400));
  }

  const versions = await Version.find({
    entityType,
    entityId
  }).sort('-createdAt').populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    count: versions.length,
    data: versions
  });
});

// @desc    Récupérer une version spécifique
// @route   GET /api/versions/:id
// @access  Private
exports.getVersion = asyncHandler(async (req, res, next) => {
  const version = await Version.findById(req.params.id).populate('createdBy', 'name');

  if (!version) {
    return next(new ErrorResponse(`Version non trouvée avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: version
  });
});

// @desc    Créer une nouvelle version
// @route   POST /api/versions
// @access  Private
exports.createVersion = asyncHandler(async (req, res, next) => {
  const { entityType, entityId, data, comment } = req.body;

  // Valider le type d'entité
  if (!['page', 'theme', 'settings'].includes(entityType)) {
    return next(new ErrorResponse('Type d\'entité invalide', 400));
  }

  // Vérifier que l'entité existe
  let entity;
  switch (entityType) {
    case 'page':
      entity = await Page.findById(entityId);
      break;
    case 'theme':
      entity = await Theme.findById(entityId);
      break;
    case 'settings':
      entity = await Settings.findById(entityId);
      break;
  }

  if (!entity) {
    return next(new ErrorResponse(`Entité non trouvée avec l'id ${entityId}`, 404));
  }

  // Créer la version
  const version = await Version.create({
    entityType,
    entityId,
    data: data || entity,
    comment,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: version
  });
});

// @desc    Restaurer une version
// @route   POST /api/versions/:id/restore
// @access  Private
exports.restoreVersion = asyncHandler(async (req, res, next) => {
  const version = await Version.findById(req.params.id);

  if (!version) {
    return next(new ErrorResponse(`Version non trouvée avec l'id ${req.params.id}`, 404));
  }

  // Restaurer l'entité à cette version
  const { entityType, entityId, data } = version;
  
  // Supprimer des champs qui ne doivent pas être restaurés
  const restoreData = { ...data };
  if (restoreData._id) delete restoreData._id;
  if (restoreData.createdAt) delete restoreData.createdAt;
  
  // Ajouter les informations de mise à jour
  restoreData.updatedBy = req.user.id;
  restoreData.updatedAt = Date.now();

  // Mettre à jour l'entité
  let entity;
  switch (entityType) {
    case 'page':
      entity = await Page.findByIdAndUpdate(entityId, restoreData, {
        new: true,
        runValidators: true
      });
      break;
    case 'theme':
      entity = await Theme.findByIdAndUpdate(entityId, restoreData, {
        new: true,
        runValidators: true
      });
      break;
    case 'settings':
      entity = await Settings.findByIdAndUpdate(entityId, restoreData, {
        new: true,
        runValidators: true
      });
      break;
  }

  if (!entity) {
    return next(new ErrorResponse(`Impossible de restaurer l'entité avec l'id ${entityId}`, 404));
  }

  // Créer une nouvelle version après restauration
  await Version.create({
    entityType,
    entityId,
    data: entity,
    comment: `Restauré depuis la version du ${new Date(version.createdAt).toLocaleString()}`,
    createdBy: req.user.id
  });

  res.status(200).json({
    success: true,
    data: entity,
    message: 'Version restaurée avec succès'
  });
});
