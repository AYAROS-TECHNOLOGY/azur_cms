const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const glob = require('glob');
const marked = require('marked');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const { v4: uuidv4 } = require('uuid');

/**
 * Génère un site statique complet
 * @param {Array} pages - Liste des pages à générer
 * @param {Object} theme - Thème à utiliser
 * @param {Object} settings - Paramètres du site
 * @param {String} buildDir - Répertoire de destination
 * @returns {Object} Résultat de la génération
 */
exports.generateSite = async (pages, theme, settings, buildDir) => {
  try {
    const startTime = Date.now();
    console.log(`Début de la génération du site dans ${buildDir}`);
    
    // Créer les répertoires nécessaires
    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'assets', 'css'), { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'assets', 'js'), { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'assets', 'images'), { recursive: true });
    fs.mkdirSync(path.join(buildDir, 'uploads'), { recursive: true });
    
    // Copier les assets statiques
    await copyStaticAssets(buildDir);
    
    // Générer le CSS du thème
    const themeCSS = generateThemeCSS(theme);
    fs.writeFileSync(path.join(buildDir, 'assets', 'css', 'theme.css'), themeCSS);
    
    // Générer les fichiers JS
    const mainJS = generateMainJS();
    fs.writeFileSync(path.join(buildDir, 'assets', 'js', 'main.js'), mainJS);
    
    // Générer chaque page
    const generatedPages = [];
    for (const page of pages) {
      try {
        const fileName = page.slug === 'accueil' || page.slug === 'home' || page.slug === 'index' 
          ? 'index.html' 
          : `${page.slug}.html`;
        
        const pageContent = await generatePage(page, theme, settings);
        fs.writeFileSync(path.join(buildDir, fileName), pageContent);
        
        generatedPages.push({
          title: page.title,
          slug: page.slug,
          fileName
        });
        
        console.log(`Page générée: ${fileName}`);
      } catch (err) {
        console.error(`Erreur lors de la génération de la page ${page.slug}:`, err);
      }
    }
    
    // Générer le sitemap
    const sitemap = generateSitemap(generatedPages, settings);
    fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap);
    
    // Générer le robots.txt
    const robotsTxt = generateRobotsTxt(settings);
    fs.writeFileSync(path.join(buildDir, 'robots.txt'), robotsTxt);
    
    const endTime = Date.now();
    console.log(`Génération du site terminée en ${(endTime - startTime) / 1000} secondes`);
    
    return {
      success: true,
      pageCount: generatedPages.length,
      buildDir,
      duration: endTime - startTime
    };
  } catch (err) {
    console.error('Erreur lors de la génération du site:', err);
    throw err;
  }
};

/**
 * Copie les assets statiques vers le répertoire de build
 * @param {String} buildDir - Répertoire de destination
 */
const copyStaticAssets = async (buildDir) => {
  // Chemin des assets statiques
  const staticDir = path.join(__dirname, '..', 'static');
  
  // Copier les images
  glob.sync(path.join(staticDir, 'images', '**', '*')).forEach(file => {
    const relativePath = path.relative(path.join(staticDir, 'images'), file);
    const destPath = path.join(buildDir, 'assets', 'images', relativePath);
    
    // Créer le répertoire de destination si nécessaire
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // Copier le fichier
    fs.copyFileSync(file, destPath);
  });
  
  // Copier les uploads
  const uploadsDir = process.env.FILE_UPLOAD_PATH || path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    glob.sync(path.join(uploadsDir, '**', '*')).forEach(file => {
      const relativePath = path.relative(uploadsDir, file);
      const destPath = path.join(buildDir, 'uploads', relativePath);
      
      // Créer le répertoire de destination si nécessaire
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      
      // Copier le fichier
      fs.copyFileSync(file, destPath);
    });
  }
};

/**
 * Génère le CSS du thème
 * @param {Object} theme - Thème à utiliser
 * @returns {String} CSS minifié
 */
const generateThemeCSS = (theme) => {
  if (!theme) {
    return '/* Aucun thème disponible */';
  }
  
  // Variables CSS du thème
  let css = `:root {
  --color-primary: ${theme.colors.primary || '#3B82F6'};
  --color-secondary: ${theme.colors.secondary || '#10B981'};
  --color-accent: ${theme.colors.accent || '#F59E0B'};
  --color-background: ${theme.colors.background || '#FFFFFF'};
  --color-text: ${theme.colors.text || '#1F2937'};
  --font-heading: ${theme.fonts.heading || 'sans-serif'};
  --font-body: ${theme.fonts.body || 'sans-serif'};
}\n\n`;
  
  // Base styles
  css += `body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

a {
  color: var(--color-primary);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}\n\n`;
  
  // Ajouter le CSS personnalisé du thème
  if (theme.customCSS) {
    css += theme.customCSS;
  }
  
  // Minifier le CSS
  return new CleanCSS().minify(css).styles;
};

/**
 * Génère le JavaScript principal
 * @returns {String} JavaScript minifié
 */
const generateMainJS = () => {
  const js = `
    // Fonction pour les animations
    document.addEventListener('DOMContentLoaded', () => {
      // Animations
      const animatedElements = document.querySelectorAll('[data-animation]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const animation = entry.target.getAttribute('data-animation');
            entry.target.classList.add(animation);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      animatedElements.forEach(el => {
        observer.observe(el);
      });
    });
  `;
  
  // Minifier le JS
  return UglifyJS.minify(js).code;
};

/**
 * Génère une page HTML complète
 * @param {Object} page - Page à générer
 * @param {Object} theme - Thème à utiliser
 * @param {Object} settings - Paramètres du site
 * @returns {String} Contenu HTML de la page
 */
const generatePage = async (page, theme, settings) => {
  // Récupérer le template de la page
  const templatePath = page.template 
    ? path.join(__dirname, '..', 'templates', `${page.template}.ejs`)
    : path.join(__dirname, '..', 'templates', 'default.ejs');
  
  // Vérifier si le template existe, sinon utiliser le template par défaut
  const template = fs.existsSync(templatePath)
    ? fs.readFileSync(templatePath, 'utf8')
    : fs.readFileSync(path.join(__dirname, '..', 'templates', 'default.ejs'), 'utf8');
  
  // Préparer les blocs
  const processedBlocks = await processPageBlocks(page.blocks);
  
  // Préparer les méta-données
  const meta = {
    title: page.meta && page.meta.title ? page.meta.title : page.title,
    description: page.meta && page.meta.description ? page.meta.description : page.description,
    keywords: page.meta && page.meta.keywords ? page.meta.keywords : ''
  };
  
  // Préparer les données pour le template
  const templateData = {
    page,
    blocks: processedBlocks,
    theme,
    settings,
    meta
  };
  
  // Générer le HTML
  return ejs.render(template, templateData);
};

/**
 * Traite les blocs de contenu d'une page
 * @param {Array} blocks - Blocs de contenu
 * @returns {Array} Blocs traités
 */
const processPageBlocks = async (blocks) => {
  if (!blocks || !Array.isArray(blocks)) {
    return [];
  }
  
  // Trier les blocs par ordre
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  
  // Traiter chaque bloc
  return sortedBlocks.map(block => {
    // Ne pas inclure les blocs invisibles
    if (!block.isVisible) {
      return null;
    }
    
    // Préparer un ID unique pour le bloc
    const blockId = `block-${block._id || uuidv4()}`;
    
    // Préparer les attributs d'animation
    const animationAttr = block.animation && block.animation !== 'none'
      ? `data-animation="${block.animation}"`
      : '';
    
    // Traiter le contenu selon le type de bloc
    let processedContent = '';
    
    if (block.type === 'text') {
      // Pour les blocs de texte, utiliser le contenu tel quel
      processedContent = block.content;
    } else if (block.type === 'image') {
      // Pour les blocs d'image, créer une balise img
      processedContent = `<img src="${block.content.src}" alt="${block.content.alt || ''}" class="img-fluid" />`;
    } else if (block.type === 'video') {
      // Pour les blocs vidéo, créer une balise vidéo
      processedContent = `<video src="${block.content.src}" controls ${block.content.autoplay ? 'autoplay' : ''} ${block.content.loop ? 'loop' : ''} class="video-fluid"></video>`;
    } else if (block.type === 'markdown') {
      // Pour les blocs markdown, convertir en HTML
      processedContent = marked(block.content);
    }
    
    // Convertir les styles en attribut style
    const styleAttrs = block.styles ? Object.entries(block.styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ') : '';
    
    // Retourner le bloc traité
    return {
      ...block,
      id: blockId,
      processedContent,
      styleAttr: styleAttrs ? `style="${styleAttrs}"` : '',
      animationAttr
    };
  }).filter(Boolean); // Filtrer les blocs null (invisibles)
};

/**
 * Génère le sitemap XML
 * @param {Array} pages - Pages générées
 * @param {Object} settings - Paramètres du site
 * @returns {String} Contenu XML du sitemap
 */
const generateSitemap = (pages, settings) => {
  const baseUrl = settings.siteUrl || 'http://example.com';
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pages.forEach(page => {
    const url = page.fileName === 'index.html'
      ? baseUrl
      : `${baseUrl}/${page.fileName}`;
    
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
};

/**
 * Génère le fichier robots.txt
 * @param {Object} settings - Paramètres du site
 * @returns {String} Contenu du fichier robots.txt
 */
const generateRobotsTxt = (settings) => {
  const baseUrl = settings.siteUrl || 'http://example.com';
  
  let content = 'User-agent: *\n';
  content += 'Allow: /\n\n';
  content += `Sitemap: ${baseUrl}/sitemap.xml\n`;
  
  return content;
};