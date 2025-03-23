const AWS = require('aws-sdk');
const { BlobServiceClient } = require('@azure/storage-blob');
const NetlifyAPI = require('netlify');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const archiver = require('archiver');

/**
 * Déploie un site sur AWS S3 et CloudFront (optionnel)
 * @param {String} buildDir - Répertoire contenant les fichiers à déployer
 * @param {Object} config - Configuration AWS
 * @returns {Object} Résultat du déploiement
 */
exports.deployToAWS = async (buildDir, config) => {
  console.log(`Déploiement sur AWS S3 (bucket: ${config.bucketName})`);
  
  // Configurer AWS
  AWS.config.update({
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  });
  
  // Créer le client S3
  const s3 = new AWS.S3();
  
  // Vérifier que le bucket existe
  try {
    await s3.headBucket({ Bucket: config.bucketName }).promise();
  } catch (err) {
    console.error(`Erreur: Le bucket ${config.bucketName} n'existe pas ou est inaccessible`);
    throw new Error(`Le bucket ${config.bucketName} n'existe pas ou est inaccessible`);
  }
  
  // Récupérer tous les fichiers à déployer
  const files = glob.sync(`${buildDir}/**/*`, { nodir: true });
  
  // Téléverser chaque fichier
  for (const file of files) {
    const fileContent = fs.readFileSync(file);
    const relPath = path.relative(buildDir, file);
    
    // Déterminer le type de contenu (Content-Type)
    const contentType = getContentType(file);
    
    // Paramètres du téléversement
    const params = {
      Bucket: config.bucketName,
      Key: relPath,
      Body: fileContent,
      ContentType: contentType
    };
    
    // Téléverser le fichier
    await s3.putObject(params).promise();
    console.log(`Fichier téléversé: ${relPath}`);
  }
  
  // Si un ID de distribution CloudFront est fourni, invalider le cache
  if (config.distributionId) {
    const cloudfront = new AWS.CloudFront();
    
    await cloudfront.createInvalidation({
      DistributionId: config.distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ['/*']
        }
      }
    }).promise();
    
    console.log(`Cache CloudFront invalidé pour la distribution ${config.distributionId}`);
  }
  
  // URL du site
  const url = config.distributionId
    ? `https://${config.bucketName}.s3.amazonaws.com/index.html`
    : `http://${config.bucketName}.s3-website-${config.region}.amazonaws.com`;
  
  return {
    success: true,
    provider: 'aws',
    url,
    bucket: config.bucketName,
    fileCount: files.length
  };
};

/**
 * Déploie un site sur Azure Blob Storage
 * @param {String} buildDir - Répertoire contenant les fichiers à déployer
 * @param {Object} config - Configuration Azure
 * @returns {Object} Résultat du déploiement
 */
exports.deployToAzure = async (buildDir, config) => {
  console.log(`Déploiement sur Azure Blob Storage (storage: ${config.storageName})`);
  
  // Connexion string pour le compte de stockage
  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${config.storageName};AccountKey=${config.accountKey};EndpointSuffix=core.windows.net`;
  
  // Créer le client Blob Service
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  
  // Obtenir une référence au conteneur $web (pour le stockage de sites statiques)
  const containerClient = blobServiceClient.getContainerClient('$web');
  
  // Récupérer tous les fichiers à déployer
  const files = glob.sync(`${buildDir}/**/*`, { nodir: true });
  
  // Téléverser chaque fichier
  for (const file of files) {
    const fileContent = fs.readFileSync(file);
    const relPath = path.relative(buildDir, file).replace(/\\/g, '/');
    
    // Déterminer le type de contenu (Content-Type)
    const contentType = getContentType(file);
    
    // Obtenir un client pour le blob
    const blockBlobClient = containerClient.getBlockBlobClient(relPath);
    
    // Téléverser le fichier
    await blockBlobClient.upload(fileContent, fileContent.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    console.log(`Fichier téléversé: ${relPath}`);
  }
  
  // URL du site
  const url = `https://${config.storageName}.z1.web.core.windows.net`;
  
  return {
    success: true,
    provider: 'azure',
    url,
    storageAccount: config.storageName,
    fileCount: files.length
  };
};

/**
 * Déploie un site sur Netlify
 * @param {String} buildDir - Répertoire contenant les fichiers à déployer
 * @param {Object} config - Configuration Netlify
 * @returns {Object} Résultat du déploiement
 */
exports.deployToNetlify = async (buildDir, config) => {
  console.log(`Déploiement sur Netlify (site: ${config.siteName})`);
  
  // Créer un client Netlify
  const netlify = new NetlifyAPI(config.token);
  
  // Créer une archive ZIP du site
  const zipPath = path.join(process.env.TEMP_PATH || '/tmp', `deploy_${Date.now()}.zip`);
  await createZipArchive(buildDir, zipPath);
  
  // Trouver le site à déployer
  let siteId;
  
  try {
    const sites = await netlify.listSites();
    const site = sites.find(s => s.name === config.siteName);
    
    if (site) {
      siteId = site.id;
    } else {
      // Créer un nouveau site si aucun n'est trouvé
      const newSite = await netlify.createSite({
        name: config.siteName,
        body: {
          name: config.siteName
        }
      });
      siteId = newSite.id;
    }
  } catch (err) {
    console.error('Erreur lors de la récupération/création du site Netlify:', err);
    throw err;
  }
  
  // Déployer le site
  const deploy = await netlify.deploy(siteId, zipPath, {
    draft: false,
    message: `Déploiement automatique via MiniCMS - ${new Date().toISOString()}`
  });
  
  // Nettoyer le fichier ZIP
  fs.unlinkSync(zipPath);
  
  return {
    success: true,
    provider: 'netlify',
    url: deploy.url,
    siteId,
    deployId: deploy.id
  };
};

/**
 * Crée une archive ZIP d'un répertoire
 * @param {String} sourceDir - Répertoire source
 * @param {String} outputPath - Chemin de l'archive ZIP
 * @returns {Promise} Promesse résolue lorsque l'archive est créée
 */
const createZipArchive = (sourceDir, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Niveau de compression maximal
    });
    
    output.on('close', () => {
      console.log(`Archive ZIP créée: ${outputPath} (${archive.pointer()} octets)`);
      resolve();
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Ajouter tous les fichiers
    archive.directory(sourceDir, false);
    
    // Finaliser l'archive
    archive.finalize();
  });
};

/**
 * Détermine le type de contenu (Content-Type) d'un fichier
 * @param {String} filePath - Chemin du fichier
 * @returns {String} Type de contenu
 */
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  };
  
  return contentTypes[ext] || 'application/octet-stream';
};