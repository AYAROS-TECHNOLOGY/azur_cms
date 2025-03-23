const Page = require('../models/page');
const Block = require('../models/block');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const versioning = require('../utils/versioning');

// @desc    Récupérer toutes les pages
// @route   GET /api/pages
// @access  Private
exports.getPages = asyncHandler(async (req, res, next) => {
  const pages = await Page.find().sort('-updatedAt');

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages
  });
});

// @desc    Récupérer une page spécifique avec ses blocs
// @route   GET /api/pages/:id
// @access  Private
exports.getPage = asyncHandler(async (req, res, next) => {
  const page = await Page.findById(req.params.id).populate('blocks');

  if (!page) {
    return next(new ErrorResponse(`Page non trouvée avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: page
  });
});

// @desc    Créer une nouvelle page
// @route   POST /api/pages
// @access  Private
exports.createPage = asyncHandler(async (req, res, next) => {
  // Ajouter l'utilisateur à la requête
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const page = await Page.create(req.body);

  // Créer une version initiale
  await versioning.createVersion('page', page._id, page, req.user.id);

  res.status(201).json({
    success: true,
    data: page
  });
});

// @desc    Mettre à jour une page
// @route   PUT /api/pages/:id
// @access  Private
exports.updatePage = asyncHandler(async (req, res, next) => {
  let page = await Page.findById(req.params.id);

  if (!page) {
    return next(new ErrorResponse(`Page non trouvée avec l'id ${req.params.id}`, 404));
  }

  // Ajouter l'utilisateur qui met à jour
  req.body.updatedBy = req.user.id;
  req.body.updatedAt = Date.now();

  page = await Page.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Créer une nouvelle version
  await versioning.createVersion('page', page._id, page, req.user.id);

  res.status(200).json({
    success: true,
    data: page
  });
});

// @desc    Supprimer une page et ses blocs
// @route   DELETE /api/pages/:id
// @access  Private
exports.deletePage = asyncHandler(async (req, res, next) => {
  const page = await Page.findById(req.params.id);

  if (!page) {
    return next(new ErrorResponse(`Page non trouvée avec l'id ${req.params.id}`, 404));
  }

  // Supprimer tous les blocs associés
  await Block.deleteMany({ _id: { $in: page.blocks } });

  // Supprimer la page
  await page.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Publier une page
// @route   PUT /api/pages/:id/publish
// @access  Private
exports.publishPage = asyncHandler(async (req, res, next) => {
  let page = await Page.findById(req.params.id);

  if (!page) {
    return next(new ErrorResponse(`Page non trouvée avec l'id ${req.params.id}`, 404));
  }

  page = await Page.findByIdAndUpdate(req.params.id, { isPublished: true, updatedBy: req.user.id, updatedAt: Date.now() }, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: page
  });
});

// @desc    Dupliquer une page
// @route   POST /api/pages/:id/duplicate
// @access  Private
exports.duplicatePage = asyncHandler(async (req, res, next) => {
  // Trouver la page à dupliquer
  const sourcePage = await Page.findById(req.params.id).populate('blocks');

  if (!sourcePage) {
    return next(new ErrorResponse(`Page non trouvée avec l'id ${req.params.id}`, 404));
  }

  // Dupliquer la page
  const duplicatedPage = {
    title: `${sourcePage.title} (copie)`,
    slug: `${sourcePage.slug}-copy`,
    description: sourcePage.description,
    template: sourcePage.template,
    meta: sourcePage.meta,
    createdBy: req.user.id,
    updatedBy: req.user.id
  };

  const newPage = await Page.create(duplicatedPage);

  // Dupliquer les blocs
  const newBlocks = [];
  for (const block of sourcePage.blocks) {
    const newBlock = await Block.create({
      type: block.type,
      name: block.name,
      content: block.content,
      styles: block.styles,
      animation: block.animation,
      position: block.position,
      order: block.order,
      isVisible: block.isVisible
    });
    newBlocks.push(newBlock._id);
  }

  // Mettre à jour la page avec les nouveaux blocs
  newPage.blocks = newBlocks;
  await newPage.save();

  // Créer une version initiale
  await versioning.createVersion('page', newPage._id, newPage, req.user.id);

  res.status(201).json({
    success: true,
    data: newPage
  });
});