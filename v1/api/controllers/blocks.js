const Block = require('../models/block');
const Page = require('../models/page');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les blocs
// @route   GET /api/blocks
// @access  Private
exports.getBlocks = asyncHandler(async (req, res, next) => {
  let query;

  // Si un pageId est fourni, filtrer par page
  if (req.query.page) {
    query = Block.find({ page: req.query.page }).sort('order');
  } else {
    query = Block.find().sort('order');
  }

  const blocks = await query;

  res.status(200).json({
    success: true,
    count: blocks.length,
    data: blocks
  });
});

// @desc    Récupérer un bloc spécifique
// @route   GET /api/blocks/:id
// @access  Private
exports.getBlock = asyncHandler(async (req, res, next) => {
  const block = await Block.findById(req.params.id);

  if (!block) {
    return next(new ErrorResponse(`Bloc non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: block
  });
});

// @desc    Créer un nouveau bloc et l'associer à une page
// @route   POST /api/blocks
// @access  Private
exports.createBlock = asyncHandler(async (req, res, next) => {
  const block = await Block.create(req.body);

  // Si une page est spécifiée, ajouter le bloc à cette page
  if (req.body.pageId) {
    const page = await Page.findById(req.body.pageId);
    if (page) {
      page.blocks.push(block._id);
      page.updatedBy = req.user.id;
      page.updatedAt = Date.now();
      await page.save();
    }
  }

  res.status(201).json({
    success: true,
    data: block
  });
});

// @desc    Mettre à jour un bloc
// @route   PUT /api/blocks/:id
// @access  Private
exports.updateBlock = asyncHandler(async (req, res, next) => {
  let block = await Block.findById(req.params.id);

  if (!block) {
    return next(new ErrorResponse(`Bloc non trouvé avec l'id ${req.params.id}`, 404));
  }

  block = await Block.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Mettre à jour la date de modification de la page associée
  if (req.body.pageId) {
    await Page.findByIdAndUpdate(req.body.pageId, { 
      updatedBy: req.user.id, 
      updatedAt: Date.now() 
    });
  }

  res.status(200).json({
    success: true,
    data: block
  });
});

// @desc    Supprimer un bloc
// @route   DELETE /api/blocks/:id
// @access  Private
exports.deleteBlock = asyncHandler(async (req, res, next) => {
  const block = await Block.findById(req.params.id);

  if (!block) {
    return next(new ErrorResponse(`Bloc non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Supprimer le bloc
  await block.remove();

  // Mettre à jour la page associée en supprimant la référence au bloc
  if (req.query.pageId) {
    const page = await Page.findById(req.query.pageId);
    if (page) {
      page.blocks = page.blocks.filter(b => b.toString() !== req.params.id);
      page.updatedBy = req.user.id;
      page.updatedAt = Date.now();
      await page.save();
    }
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mettre à jour la position d'un bloc
// @route   PUT /api/blocks/:id/position
// @access  Private
exports.updateBlockPosition = asyncHandler(async (req, res, next) => {
  const { position, pageId } = req.body;
  
  if (!position) {
    return next(new ErrorResponse('Veuillez fournir une position', 400));
  }

  let block = await Block.findById(req.params.id);

  if (!block) {
    return next(new ErrorResponse(`Bloc non trouvé avec l'id ${req.params.id}`, 404));
  }

  block = await Block.findByIdAndUpdate(req.params.id, { position }, {
    new: true,
    runValidators: true
  });

  // Mettre à jour la date de modification de la page associée
  if (pageId) {
    await Page.findByIdAndUpdate(pageId, { 
      updatedBy: req.user.id, 
      updatedAt: Date.now() 
    });
  }

  res.status(200).json({
    success: true,
    data: block
  });
});