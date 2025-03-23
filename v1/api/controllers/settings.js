const Settings = require('../models/settings');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const nodemailer = require('nodemailer');
const versioning = require('../utils/versioning');

// @desc    Récupérer les paramètres du site
// @route   GET /api/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Récupérer les paramètres ou créer l'objet s'il n'existe pas
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      siteTitle: 'Mon Site Web',
      siteDescription: 'Un site créé avec MiniCMS',
      updatedBy: req.user.id
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Mettre à jour les paramètres du site
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // Récupérer les paramètres ou créer l'objet s'il n'existe pas
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      ...req.body,
      updatedBy: req.user.id
    });
  } else {
    // Mettre à jour
    settings = await Settings.findByIdAndUpdate(settings._id, {
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    }, {
      new: true,
      runValidators: true
    });
  }

  // Créer une version
  await versioning.createVersion('settings', settings._id, settings, req.user.id);

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Mettre à jour les paramètres SMTP
// @route   PUT /api/settings/smtp
// @access  Private
exports.updateSMTP = asyncHandler(async (req, res, next) => {
  const { host, port, secure, user, pass } = req.body;

  // Valider les informations minimales
  if (!host || !port) {
    return next(new ErrorResponse('Veuillez fournir un hôte et un port SMTP', 400));
  }

  // Récupérer les paramètres
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      siteTitle: 'Mon Site Web',
      siteDescription: 'Un site créé avec MiniCMS',
      smtp: { host, port, secure, user, pass },
      updatedBy: req.user.id
    });
  } else {
    // Mettre à jour uniquement les paramètres SMTP
    settings = await Settings.findByIdAndUpdate(settings._id, {
      smtp: { host, port, secure, user, pass },
      updatedBy: req.user.id,
      updatedAt: Date.now()
    }, {
      new: true,
      runValidators: true
    });
  }

  // Tester la connexion SMTP
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure || false,
      auth: user && pass ? {
        user,
        pass
      } : undefined
    });

    // Vérifier la connexion
    await transporter.verify();

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Configuration SMTP validée avec succès'
    });
  } catch (err) {
    console.error('Erreur de connexion SMTP:', err);
    
    // Enregistrer la configuration même si le test échoue
    res.status(200).json({
      success: true,
      data: settings,
      warning: 'Configuration SMTP enregistrée mais le test de connexion a échoué'
    });
  }
});