const Theme = require('../models/theme');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const versioning = require('../utils/versioning');
const path = require('path');
const fs = require('fs');

// @desc    Récupérer tous les thèmes
// @route   GET /api/themes
// @access  Private
exports.getThemes = asyncHandler(async (req, res, next) => {
  const themes = await Theme.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: themes.length,
    data: themes
  });
});

// @desc    Récupérer un thème spécifique
// @route   GET /api/themes/:id
// @access  Private
exports.getTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    return next(new ErrorResponse(`Thème non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: theme
  });
});

// @desc    Créer un nouveau thème
// @route   POST /api/themes
// @access  Private
exports.createTheme = asyncHandler(async (req, res, next) => {
  // Ajouter l'utilisateur créateur
  req.body.createdBy = req.user.id;

  const theme = await Theme.create(req.body);

  // Créer une version initiale
  await versioning.createVersion('theme', theme._id, theme, req.user.id);

  res.status(201).json({
    success: true,
    data: theme
  });
});

// @desc    Mettre à jour un thème
// @route   PUT /api/themes/:id
// @access  Private
exports.updateTheme = asyncHandler(async (req, res, next) => {
  let theme = await Theme.findById(req.params.id);

  if (!theme) {
    return next(new ErrorResponse(`Thème non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Mettre à jour la date
  req.body.updatedAt = Date.now();

  theme = await Theme.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Créer une nouvelle version
  await versioning.createVersion('theme', theme._id, theme, req.user.id);

  res.status(200).json({
    success: true,
    data: theme
  });
});

// @desc    Supprimer un thème
// @route   DELETE /api/themes/:id
// @access  Private
exports.deleteTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    return next(new ErrorResponse(`Thème non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Ne pas permettre la suppression du thème actif
  if (theme.isActive) {
    return next(new ErrorResponse('Impossible de supprimer un thème actif', 400));
  }

  await theme.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Activer un thème
// @route   PUT /api/themes/:id/activate
// @access  Private
exports.activateTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    return next(new ErrorResponse(`Thème non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Désactiver tous les autres thèmes
  await Theme.updateMany({}, { isActive: false });

  // Activer ce thème
  theme.isActive = true;
  await theme.save();

  res.status(200).json({
    success: true,
    data: theme
  });
});

// @desc    Exporter un thème
// @route   GET /api/themes/:id/export
// @access  Private
exports.exportTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    return next(new ErrorResponse(`Thème non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Créer un objet d'export
  const exportData = {
    name: theme.name,
    description: theme.description,
    colors: theme.colors,
    fonts: theme.fonts,
    customCSS: theme.customCSS,
    exportedAt: Date.now()
  };

  // Nom de fichier d'export
  const exportFileName = `theme_${theme.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;

  // Chemin temporaire pour le fichier d'export
  const exportPath = path.join(process.env.TEMP_PATH || '/tmp', exportFileName);

  // Écrire le fichier
  fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

  // Envoyer le fichier
  res.download(exportPath, exportFileName, (err) => {
    if (err) {
      console.error('Erreur lors de l\'export du thème:', err);
    }
    
    // Supprimer le fichier temporaire après envoi
    fs.unlinkSync(exportPath);
  });
});

// @desc    Importer un thème
// @route   POST /api/themes/import
// @access  Private
exports.importTheme = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Veuillez télécharger un fichier de thème', 400));
  }

  try {
    // Lire le fichier importé
    const importData = JSON.parse(fs.readFileSync(req.file.path));
    
    // Valider les données minimales
    if (!importData.name || !importData.colors) {
      return next(new ErrorResponse('Format de fichier de thème invalide', 400));
    }
    
    // Créer un nouveau thème
    const newTheme = await Theme.create({
      name: `${importData.name} (importé)`,
      description: importData.description || '',
      colors: importData.colors,
      fonts: importData.fonts,
      customCSS: importData.customCSS,
      createdBy: req.user.id
    });
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);
    
    // Créer une version initiale
    await versioning.createVersion('theme', newTheme._id, newTheme, req.user.id);
    
    res.status(201).json({
      success: true,
      data: newTheme
    });
  } catch (err) {
    console.error('Erreur lors de l\'import du thème:', err);
    
    // Supprimer le fichier temporaire en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return next(new ErrorResponse('Impossible de traiter le fichier de thème', 400));
  }
});