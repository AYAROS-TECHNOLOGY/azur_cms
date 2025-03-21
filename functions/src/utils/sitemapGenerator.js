// functions/src/utils/sitemapGenerator.js
const { Storage } = require('@google-cloud/storage');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Initialisation du stockage
const storage = new Storage();

/**
 * Génère un sitemap XML pour le site
 */
async function generateSitemap() {
  console.log('Génération du sitemap...');
  
  const tempDir = path.join(os.tmpdir(), `sitemap-${uuidv4()}`);
  const sitemapPath = path.join(tempDir, 'sitemap.xml');
  
  try {
    // Créer le répertoire temporaire
    await fs.ensureDir(tempDir);
    
    // Récupérer la structure du site
    const bucketContent = storage.bucket(process.env.BUCKET_CONTENT || 'ayurveda-cms-content');
    const structureFile = bucketContent.file('structure.json');
    const [structureContent] = await structureFile.download();
    const structure = JSON.parse(structureContent.toString());
    
    // Récupérer le domaine du site
    let domain = 'https://www.ayurveda-equilibre.com';
    try {
      const settingsFile = bucketContent.file('settings/general.json');
      const [settingsExists] = await settingsFile.exists();
      
      if (settingsExists) {
        const [settingsContent] = await settingsFile.download();
        const settings = JSON.parse(settingsContent.toString());
        if (settings.domain) {
          domain = settings.domain;
        }
      }
    } catch (error) {
      console.warn('Impossible de récupérer le domaine du site, utilisation de la valeur par défaut', error);
    }
    
    // Filtrer les pages publiées
    const publishedPages = structure.pages.filter(page => page.isPublished);
    
    // Générer le contenu du sitemap
    let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Ajouter chaque page au sitemap
    for (const page of publishedPages) {
      const lastmod = new Date().toISOString().split('T')[0]; // Date du jour
      const url = `${domain}${page.path}`;
      const changefreq = page.id === 'home' ? 'weekly' : 'monthly';
      const priority = page.id === 'home' ? '1.0' : '0.8';
      
      sitemapContent += '  <url>\n';
      sitemapContent += `    <loc>${url}</loc>\n`;
      sitemapContent += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemapContent += `    <changefreq>${changefreq}</changefreq>\n`;
      sitemapContent += `    <priority>${priority}</priority>\n`;
      sitemapContent += '  </url>\n';
    }
    
    sitemapContent += '</urlset>';
    
    // Écrire le fichier sitemap
    await fs.writeFile(sitemapPath, sitemapContent);
    
    // Uploader le sitemap vers le bucket de sortie
    const bucketOutput = storage.bucket(process.env.BUCKET_OUTPUT || 'ayurveda-site-output');
    await bucketOutput.upload(sitemapPath, {
      destination: 'sitemap.xml',
      metadata: {
        contentType: 'application/xml',
        cacheControl: 'public, max-age=86400' // Cache d'un jour
      }
    });
    
    console.log('Sitemap généré et uploadé avec succès');
    
    // Nettoyer les fichiers temporaires
    await fs.remove(tempDir);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    
    // Nettoyage en cas d'erreur
    try {
      await fs.remove(tempDir);
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage:', cleanupError);
    }
    
    throw error;
  }
}

module.exports = {
  generateSitemap
};