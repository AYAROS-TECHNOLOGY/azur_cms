const Media = require('../models/media');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// @desc    Récupérer tous les médias
// @route   GET /api/media
// @access  Private
exports.getMedia = asyncHandler(async (req, res, next) => {
  const media = await Media.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: media.length,
    data: media
  });
});

// @desc    Récupérer un fichier média spécifique
// @route   GET /api/media/:id
// @access  Private
exports.getMediaFile = asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);

  if (!media) {
    return next(new ErrorResponse(`Média non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: media
  });
});

// @desc    Télécharger un média
// @route   POST /api/media
// @access  Private
exports.uploadMedia = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Veuillez télécharger un fichier', 400));
  }

  const file = req.file;
  
  // Déterminer le type de média
  let type = 'document';
  
  if (file.mimetype.startsWith('image')) {
    type = 'image';
  } else if (file.mimetype.startsWith('video')) {
    type = 'video';
  }
  
  // Créer l'entrée de média
  const media = await Media.create({
    name: file.originalname,
    type,
    url: `/uploads/${file.filename}`,
    size: file.size,
    createdBy: req.user.id
  });
  
  // Si c'est une image, ajoutez les dimensions et une miniature
  if (type === 'image') {
    try {
      const imagePath = path.join(process.env.FILE_UPLOAD_PATH, file.filename);
      const imageInfo = await sharp(imagePath).metadata();
      
      // Créer une miniature
      const thumbnailName = `thumb_${file.filename}`;
      const thumbnailPath = path.join(process.env.FILE_UPLOAD_PATH, thumbnailName);
      
      await sharp(imagePath)
        .resize(200, 200, { fit: 'inside' })
        .toFile(thumbnailPath);
      
      // Mettre à jour l'entrée média avec les dimensions et la miniature
      media.dimensions = {
        width: imageInfo.width,
        height: imageInfo.height
      };
      
      media.thumbnailUrl = `/uploads/${thumbnailName}`;
      await media.save();
    } catch (err) {
      console.error('Erreur lors du traitement de l\'image:', err);
    }
  }

  res.status(201).json({
    success: true,
    data: media
  });
});

// @desc    Mettre à jour un média
// @route   PUT /api/media/:id
// @access  Private
exports.updateMedia = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    alt: req.body.alt
  };
  
  let media = await Media.findById(req.params.id);

  if (!media) {
    return next(new ErrorResponse(`Média non trouvé avec l'id ${req.params.id}`, 404));
  }

  media = await Media.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: media
  });
});

// @desc    Supprimer un média
// @route   DELETE /api/media/:id
// @access  Private
exports.deleteMedia = asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);

  if (!media) {
    return next(new ErrorResponse(`Média non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Supprimer les fichiers physiques
  try {
    const filePath = path.join(process.env.FILE_UPLOAD_PATH, path.basename(media.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Supprimer également la miniature si elle existe
    if (media.thumbnailUrl) {
      const thumbnailPath = path.join(process.env.FILE_UPLOAD_PATH, path.basename(media.thumbnailUrl));
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
  } catch (err) {
    console.error('Erreur lors de la suppression des fichiers:', err);
  }

  // Supprimer l'entrée de la base de données
  await media.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Redimensionner une image
// @route   POST /api/media/:id/resize
// @access  Private
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const { width, height } = req.body;
  
  if (!width && !height) {
    return next(new ErrorResponse('Veuillez fournir au moins une dimension', 400));
  }
  
  const media = await Media.findById(req.params.id);

  if (!media) {
    return next(new ErrorResponse(`Média non trouvé avec l'id ${req.params.id}`, 404));
  }
  
  if (media.type !== 'image') {
    return next(new ErrorResponse('Seules les images peuvent être redimensionnées', 400));
  }
  
  try {
    const imagePath = path.join(process.env.FILE_UPLOAD_PATH, path.basename(media.url));
    const resizedName = `resized_${Date.now()}_${path.basename(media.url)}`;
    const resizedPath = path.join(process.env.FILE_UPLOAD_PATH, resizedName);
    
    // Redimensionner l'image
    await sharp(imagePath)
      .resize(parseInt(width) || null, parseInt(height) || null, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(resizedPath);
    
    // Mettre à jour l'entrée média
    const imageInfo = await sharp(resizedPath).metadata();
    
    const updatedMedia = await Media.findByIdAndUpdate(req.params.id, {
      url: `/uploads/${resizedName}`,
      dimensions: {
        width: imageInfo.width,
        height: imageInfo.height
      },
      // Recréer la miniature
      thumbnailUrl: media.thumbnailUrl
    }, {
      new: true,
      runValidators: true
    });
    
    // Créer une nouvelle miniature
    const thumbnailName = `thumb_${resizedName}`;
    const thumbnailPath = path.join(process.env.FILE_UPLOAD_PATH, thumbnailName);
    
    await sharp(resizedPath)
      .resize(200, 200, { fit: 'inside' })
      .toFile(thumbnailPath);
    
    updatedMedia.thumbnailUrl = `/uploads/${thumbnailName}`;
    await updatedMedia.save();
    
    res.status(200).json({
      success: true,
      data: updatedMedia
    });
  } catch (err) {
    console.error('Erreur lors du redimensionnement de l\'image:', err);
    return next(new ErrorResponse('Erreur lors du redimensionnement de l\'image', 500));
  }
});