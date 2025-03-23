const Version = require('../models/version');

/**
 * Crée une nouvelle version d'une entité
 * @param {String} entityType - Type d'entité (page, theme, settings)
 * @param {String} entityId - ID de l'entité
 * @param {Object} data - Données de l'entité
 * @param {String} userId - ID de l'utilisateur
 * @param {String} comment - Commentaire optionnel
 * @returns {Promise} Promesse résolue avec la version créée
 */
exports.createVersion = async (entityType, entityId, data, userId, comment = '') => {
  // Valider le type d'entité
  if (!['page', 'theme', 'settings'].includes(entityType)) {
    throw new Error('Type d\'entité invalide');
  }
  
  // Créer une copie des données
  const versionData = JSON.parse(JSON.stringify(data));
  
  // Créer la version
  return await Version.create({
    entityType,
    entityId,
    data: versionData,
    comment,
    createdBy: userId
  });
};

/**
 * Récupère les versions d'une entité
 * @param {String} entityType - Type d'entité (page, theme, settings)
 * @param {String} entityId - ID de l'entité
 * @param {Number} limit - Nombre maximum de versions à récupérer
 * @returns {Promise} Promesse résolue avec les versions
 */
exports.getVersions = async (entityType, entityId, limit = 10) => {
  return await Version.find({
    entityType,
    entityId
  })
    .sort('-createdAt')
    .limit(limit)
    .populate('createdBy', 'name');
};

/**
 * Récupère une version spécifique
 * @param {String} versionId - ID de la version
 * @returns {Promise} Promesse résolue avec la version
 */
exports.getVersion = async (versionId) => {
  return await Version.findById(versionId).populate('createdBy', 'name');
};

/**
 * Compare deux versions d'une entité
 * @param {String} versionId1 - ID de la première version
 * @param {String} versionId2 - ID de la deuxième version
 * @returns {Promise} Promesse résolue avec les différences
 */
exports.compareVersions = async (versionId1, versionId2) => {
  const [version1, version2] = await Promise.all([
    Version.findById(versionId1),
    Version.findById(versionId2)
  ]);
  
  if (!version1 || !version2) {
    throw new Error('Version non trouvée');
  }
  
  // Comparer les données
  const data1 = version1.data;
  const data2 = version2.data;
  
  // Trouver les différences
  const differences = findDifferences(data1, data2);
  
  return {
    version1: {
      id: version1._id,
      createdAt: version1.createdAt,
      comment: version1.comment
    },
    version2: {
      id: version2._id,
      createdAt: version2.createdAt,
      comment: version2.comment
    },
    differences
  };
};

/**
 * Trouve les différences entre deux objets
 * @param {Object} obj1 - Premier objet
 * @param {Object} obj2 - Deuxième objet
 * @param {String} path - Chemin actuel (pour la récursion)
 * @returns {Array} Liste des différences
 */
const findDifferences = (obj1, obj2, path = '') => {
  const differences = [];
  
  // Trouver toutes les clés
  const keys = new Set([
    ...Object.keys(obj1 || {}),
    ...Object.keys(obj2 || {})
  ]);
  
  for (const key of keys) {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Vérifier si la clé existe dans les deux objets
    const exists1 = obj1 && Object.prototype.hasOwnProperty.call(obj1, key);
    const exists2 = obj2 && Object.prototype.hasOwnProperty.call(obj2, key);
    
    if (!exists1) {
      differences.push({
        path: currentPath,
        type: 'added',
        value: obj2[key]
      });
      continue;
    }
    
    if (!exists2) {
      differences.push({
        path: currentPath,
        type: 'removed',
        value: obj1[key]
      });
      continue;
    }
    
    // Comparer les valeurs
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
      // Si les deux valeurs sont des objets, récursion
      const nestedDiffs = findDifferences(val1, val2, currentPath);
      differences.push(...nestedDiffs);
    } else if (val1 !== val2) {
      differences.push({
        path: currentPath,
        type: 'changed',
        oldValue: val1,
        newValue: val2
      });
    }
  }
  
  return differences;
};