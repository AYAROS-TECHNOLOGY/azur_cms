const Settings = require('../models/settings');
const Page = require('../models/page');
const Theme = require('../models/theme');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const generator = require('../utils/generator');
const deployer = require('../utils/deployer');
const path = require('path');
const fs = require('fs');

// Model pour l'historique des déploiements
const Deployment = require('../models/deployment');

// @desc    Déployer le site sur AWS
// @route   POST /api/deploy/aws
// @access  Private
exports.deployToAWS = asyncHandler(async (req, res, next) => {
  // Créer un enregistrement de déploiement
  const deployment = await Deployment.create({
    provider: 'aws',
    status: 'pending',
    startedBy: req.user.id
  });

  // Exécuter le déploiement de manière asynchrone
  deployProcess('aws', deployment._id, req.user.id);

  res.status(200).json({
    success: true,
    data: deployment,
    message: 'Déploiement lancé avec succès'
  });
});

// @desc    Déployer le site sur Azure
// @route   POST /api/deploy/azure
// @access  Private
exports.deployToAzure = asyncHandler(async (req, res, next) => {
  // Créer un enregistrement de déploiement
  const deployment = await Deployment.create({
    provider: 'azure',
    status: 'pending',
    startedBy: req.user.id
  });

  // Exécuter le déploiement de manière asynchrone
  deployProcess('azure', deployment._id, req.user.id);

  res.status(200).json({
    success: true,
    data: deployment,
    message: 'Déploiement lancé avec succès'
  });
});

// @desc    Déployer le site sur Netlify
// @route   POST /api/deploy/netlify
// @access  Private
exports.deployToNetlify = asyncHandler(async (req, res, next) => {
  // Créer un enregistrement de déploiement
  const deployment = await Deployment.create({
    provider: 'netlify',
    status: 'pending',
    startedBy: req.user.id
  });

  // Exécuter le déploiement de manière asynchrone
  deployProcess('netlify', deployment._id, req.user.id);

  res.status(200).json({
    success: true,
    data: deployment,
    message: 'Déploiement lancé avec succès'
  });
});

// @desc    Récupérer l'historique des déploiements
// @route   GET /api/deploy/history
// @access  Private
exports.getDeploymentHistory = asyncHandler(async (req, res, next) => {
  const deployments = await Deployment.find()
    .sort('-createdAt')
    .populate('startedBy', 'name');

  res.status(200).json({
    success: true,
    count: deployments.length,
    data: deployments
  });
});

// @desc    Récupérer le statut d'un déploiement
// @route   GET /api/deploy/status/:id.
// @access  Private
exports.getDeploymentStatus = asyncHandler(async (req, res, next) => {
  const deployment = await Deployment.findById(req.params.id)
    .populate('startedBy', 'name');

  if (!deployment) {
    return next(new ErrorResponse(`Déploiement non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: deployment
  });
});

// Fonction pour gérer le processus de déploiement
async function deployProcess(provider, deploymentId, userId) {
  let deployment;
  try {
    // Récupérer l'enregistrement de déploiement
    deployment = await Deployment.findById(deploymentId);
    
    // Récupérer les configurations
    const settings = await Settings.findOne();
    
    if (!settings || !settings.deploymentSettings || 
        settings.deploymentSettings.provider !== provider) {
      throw new Error(`Configuration de déploiement pour ${provider} non trouvée`);
    }
    
    // Étape 1: Générer le site
    deployment.logs = `Génération du site en cours...\n`;
    deployment.progress = 10;
    await deployment.save();
    
    const pages = await Page.find({ isPublished: true }).populate('blocks');
    const theme = await Theme.findOne({ isActive: true });
    
    const buildDir = path.join(process.env.BUILD_PATH || '/tmp/build', `site_${Date.now()}`);
    
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Générer le site
    const generatedSite = await generator.generateSite(pages, theme, settings, buildDir);
    
    deployment.logs += `Site généré dans ${buildDir}\n`;
    deployment.progress = 40;
    await deployment.save();
    
    // Étape 2: Déployer
    deployment.logs += `Déploiement sur ${provider} en cours...\n`;
    deployment.progress = 60;
    await deployment.save();
    
    let deployResult;
    switch (provider) {
      case 'aws':
        deployResult = await deployer.deployToAWS(buildDir, settings.deploymentSettings.config);
        break;
      case 'azure':
        deployResult = await deployer.deployToAzure(buildDir, settings.deploymentSettings.config);
        break;
      case 'netlify':
        deployResult = await deployer.deployToNetlify(buildDir, settings.deploymentSettings.config);
        break;
    }
    
    // Mettre à jour le statut
    deployment.status = 'success';
    deployment.progress = 100;
    deployment.completedAt = Date.now();
    deployment.url = deployResult.url;
    deployment.logs += `Déploiement réussi! Site disponible sur ${deployResult.url}\n`;
    await deployment.save();
    
    // Nettoyer les fichiers de build
    try {
      fs.rmdirSync(buildDir, { recursive: true });
    } catch (err) {
      console.error('Erreur lors du nettoyage des fichiers de build:', err);
    }
  } catch (err) {
    console.error(`Erreur lors du déploiement sur ${provider}:`, err);
    
    if (deployment) {
      deployment.status = 'error';
      deployment.logs += `Erreur: ${err.message}\n`;
      deployment.completedAt = Date.now();
      await deployment.save();
    }
  }
}