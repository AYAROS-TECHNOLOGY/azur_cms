const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const HTML_SOURCE = path.join(__dirname, '..', 'src', 'templates', 'original-template.html');
const OUTPUT_FILE = path.join(DATA_DIR, 'pages', 'home.json');

/**
 * Extrait le contenu HTML et génère la structure JSON pour le CMS
 */
async function extractContentFromHTML() {
  try {
    console.log('Démarrage de l\'extraction de contenu...');
    
    // Créer les répertoires nécessaires
    await fs.ensureDir(path.join(DATA_DIR, 'pages'));
    await fs.ensureDir(path.join(DATA_DIR, 'themes'));
    await fs.ensureDir(path.join(DATA_DIR, 'versions'));
    await fs.ensureDir(path.join(DATA_DIR, 'settings'));
    
    // Vérifier si le fichier HTML source existe
    if (!await fs.pathExists(HTML_SOURCE)) {
      console.error('Erreur: Le fichier HTML source n\'existe pas:', HTML_SOURCE);
      console.log('Veuillez copier le fichier HTML du site original dans:', HTML_SOURCE);
      return;
    }
    
    // Lire le fichier HTML
    const htmlContent = await fs.readFile(HTML_SOURCE, 'utf8');
    
    // Charger le HTML avec Cheerio
    const $ = cheerio.load(htmlContent);
    
    // Extraire les métadonnées de base
    const title = $('title').text() || 'Ayurveda Équilibre';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Extraire les variables CSS (couleurs, polices, etc.)
    const styleContent = $('style').html() || '';
    const cssVars = extractCssVars(styleContent);
    
    // Extraire le contenu des sections principales
    const sections = [];
    
    // En-tête
    sections.push({
      id: 'header',
      type: 'header',
      className: 'header',
      content: extractHeaderContent($)
    });
    
    // Section héro
    sections.push({
      id: 'hero',
      type: 'section',
      className: 'hero',
      content: extractHeroContent($)
    });
    
    // Section services
    sections.push({
      id: 'services',
      type: 'section',
      className: 'services',
      content: extractServicesContent($)
    });
    
    // Section philosophie
    sections.push({
      id: 'philosophy',
      type: 'section',
      className: 'philosophy',
      content: extractPhilosophyContent($)
    });
    
    // Section témoignages
    sections.push({
      id: 'testimonials',
      type: 'section',
      className: 'testimonials',
      content: extractTestimonialsContent($)
    });
    
    // Section contact
    sections.push({
      id: 'contact',
      type: 'section',
      className: 'contact',
      content: extractContactContent($)
    });
    
    // Pied de page
    sections.push({
      id: 'footer',
      type: 'footer',
      className: 'footer',
      content: extractFooterContent($)
    });
    
    // Créer l'objet de contenu de page
    const pageContent = {
      title,
      meta: {
        description: metaDescription,
        keywords: metaKeywords
      },
      theme: cssVars,
      sections,
      scripts: extractScripts($)
    };
    
    // Enregistrer la structure du site
    const structureFile = path.join(DATA_DIR, 'structure.json');
    const siteStructure = {
      pages: [
        {
          id: 'home',
          title: 'Accueil',
          path: '/',
          template: 'home',
          isPublished: true
        }
      ],
      navigation: {
        main: [
          { id: 'accueil', label: 'Accueil', path: '#accueil' },
          { id: 'services', label: 'Soins', path: '#services' },
          { id: 'philosophy', label: 'Philosophie', path: '#philosophy' },
          { id: 'testimonials', label: 'Témoignages', path: '#testimonials' },
          { id: 'contact', label: 'Contact', path: '#contact' }
        ]
      }
    };
    
    await fs.writeJson(structureFile, siteStructure, { spaces: 2 });
    console.log('Structure du site enregistrée:', structureFile);
    
    // Enregistrer le thème
    const themeFile = path.join(DATA_DIR, 'active-theme.json');
    const theme = {
      id: 'default',
      name: 'Ayurveda Équilibre',
      colors: cssVars.colors,
      fonts: cssVars.fonts
    };
    
    await fs.writeJson(themeFile, theme, { spaces: 2 });
    console.log('Thème actif enregistré:', themeFile);
    
    // Enregistrer le contenu de la page
    await fs.writeJson(OUTPUT_FILE, pageContent, { spaces: 2 });
    console.log('Contenu de la page enregistré:', OUTPUT_FILE);
    
    console.log('Extraction de contenu terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'extraction de contenu:', error);
  }
}

/**
 * Extrait les variables CSS du style
 * @param {string} styleContent - Contenu CSS
 * @returns {Object} - Objet de variables CSS
 */
function extractCssVars(styleContent) {
  const vars = {};
  
  // Extraire les variables CSS de :root
  const rootVarsMatch = styleContent.match(/:root\s*{([^}]+)}/);
  if (rootVarsMatch && rootVarsMatch[1]) {
    const varDeclarations = rootVarsMatch[1].match(/--[a-zA-Z0-9-]+\s*:\s*[^;]+/g) || [];
    
    varDeclarations.forEach(declaration => {
      const [name, value] = declaration.split(':').map(str => str.trim());
      vars[name] = value;
    });
  }
  
  // Structure plus lisible pour l'interface d'édition
  return {
    colors: {
      primary: vars['--color-primary'] || '#0a4b44',
      accent: vars['--color-accent'] || '#d4a039',
      light: vars['--color-light'] || '#f9f5f0',
      dark: vars['--color-dark'] || '#1f332e',
      neutral: vars['--color-neutral'] || '#e6e0d4'
    },
    fonts: {
      heading: vars['--font-heading'] || "'Cormorant Garamond', serif",
      body: vars['--font-body'] || "'Montserrat', sans-serif"
    }
  };
}

/**
 * Extrait le contenu de l'en-tête
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu de l'en-tête
 */
function extractHeaderContent($) {
  const content = [];
  
  // Logo
  const logo = $('.header .logo');
  if (logo.length) {
    content.push({
      id: 'header-logo',
      type: 'logo',
      text: logo.text()
    });
  }
  
  // Menu de navigation
  const navItems = [];
  $('.header .nav-menu li').each((index, item) => {
    const $item = $(item);
    const link = $item.find('a');
    
    navItems.push({
      id: `nav-item-${index}`,
      label: link.text(),
      url: link.attr('href') || '#'
    });
  });
  
  if (navItems.length) {
    content.push({
      id: 'main-navigation',
      type: 'navigation',
      items: navItems
    });
  }
  
  // Bouton CTA
  const ctaBtn = $('.header .cta-btn');
  if (ctaBtn.length) {
    content.push({
      id: 'header-cta',
      type: 'button',
      text: ctaBtn.text(),
      url: ctaBtn.attr('href') || '#',
      className: ctaBtn.attr('class') || ''
    });
  }
  
  return content;
}

/**
 * Extrait le contenu de la section héro
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu de la section héro
 */
function extractHeroContent($) {
  const content = [];
  const heroSection = $('.hero');
  
  // Contenu texte héro
  const heroContent = heroSection.find('.hero-content');
  if (heroContent.length) {
    content.push({
      id: 'hero-content',
      type: 'heroContent',
      title: heroContent.find('.hero-title').text(),
      subtitle: heroContent.find('.hero-subtitle').text(),
      buttonText: heroContent.find('.hero-btn').text(),
      buttonLink: heroContent.find('.hero-btn').attr('href') || '#'
    });
  }
  
  // Image héro
  const heroImage = heroSection.find('.hero-image img');
  if (heroImage.length) {
    content.push({
      id: 'hero-image',
      type: 'heroImage',
      src: heroImage.attr('src') || '',
      alt: heroImage.attr('alt') || ''
    });
  }
  
  return content;
}

/**
 * Extrait le contenu de la section services
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu de la section services
 */
function extractServicesContent($) {
  const content = [];
  const servicesSection = $('.services');
  
  // Titre de section
  const titleContainer = servicesSection.find('.section-title-container');
  if (titleContainer.length) {
    content.push({
      id: 'services-header',
      type: 'sectionHeader',
      title: titleContainer.find('.section-title').text(),
      subtitle: titleContainer.find('.section-subtitle').text()
    });
  }
  
  // Cartes de services
  const serviceCards = [];
  servicesSection.find('.service-card').each((index, card) => {
    const $card = $(card);
    
    serviceCards.push({
      id: `service-${index}`,
      type: 'serviceCard',
      title: $card.find('.service-title').text(),
      description: $card.find('.service-desc').text(),
      image: $card.find('img').attr('src') || '',
      imageAlt: $card.find('img').attr('alt') || '',
      duration: $card.find('.detail-value').first().text(),
      price: $card.find('.detail-value').last().text(),
      linkText: $card.find('.service-link').text().trim(),
      linkUrl: $card.find('.service-link').attr('href') || '#'
    });
  });
  
  if (serviceCards.length) {
    content.push({
      id: 'services-container',
      type: 'servicesContainer',
      items: serviceCards
    });
  }
  
  return content;
}

/**
 * Extrait le contenu de la section philosophie
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu de la section philosophie
 */
function extractPhilosophyContent($) {
  const content = [];
  const philosophySection = $('.philosophy');
  
  // Images
  const images = [];
  philosophySection.find('.philosophy-img-1, .philosophy-img-2').each((index, img) => {
    const $img = $(img);
    
    images.push({
      id: `philosophy-img-${index}`,
      type: 'image',
      src: $img.find('img').attr('src') || '',
      alt: $img.find('img').attr('alt') || '',
      className: $img.attr('class') || ''
    });
  });
  
  if (images.length) {
    content.push({
      id: 'philosophy-images',
      type: 'imageGallery',
      items: images
    });
  }
  
  // Contenu texte
  const contentSection = philosophySection.find('.philosophy-content');
  if (contentSection.length) {
    content.push({
      id: 'philosophy-content',
      type: 'richText',
      title: contentSection.find('.philosophy-title').text(),
      paragraphs: contentSection.find('.philosophy-text').map((i, el) => $(el).text()).get()
    });
  }
  
  // Principes
  const principles = [];
  philosophySection.find('.principle').each((index, principle) => {
    const $principle = $(principle);
    
    principles.push({
      id: `principle-${index}`,
      type: 'card',
      icon: $principle.find('.principle-icon').text(),
      title: $principle.find('.principle-title').text(),
      description: $principle.find('.principle-desc').text()
    });
  });
  
  if (principles.length) {
    content.push({
      id: 'principles-container',
      type: 'cardsContainer',
      items: principles
    });
  }
  
  return content;
}

/**
 * Extrait le contenu de la section témoignages
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu de la section témoignages
 */
function extractTestimonialsContent($) {
  const content = [];
  const testimonialsSection = $('.testimonials');
  
  // Titre de section
  const titleContainer = testimonialsSection.find('.section-title-container');
  if (titleContainer.length) {
    content.push({
      id: 'testimonials-header',
      type: 'sectionHeader',
      title: titleContainer.find('.section-title').text(),
      subtitle: titleContainer.find('.section-subtitle').text()
    });
  }
  
  // Témoignages
  const testimonials = [];
  testimonialsSection.find('.testimonial-card').each((index, card) => {
    const $card = $(card);
    
    testimonials.push({
      id: `testimonial-${index}`,
      type: 'testimonial',
      content: $card.find('.testimonial-content').text(),
      author: {
        name: $card.find('.author-info h3').text(),
        image: $card.find('.author-img img').attr('src') || '',
        rating: $card.find('.stars').text().length / 2 // Compte approximatif des étoiles
      }
    });
  });
  
  if (testimonials.length) {
    content.push({
      id: 'testimonials-carousel',
      type: 'testimonialsCarousel',
      items: testimonials
    });
  }
  
  return content;
}

/**
 * Extrait le contenu de la section contact
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu de la section contact
 */
function extractContactContent($) {
  const content = [];
  const contactSection = $('.contact');
  
  // Infos de contact
  const contactInfo = contactSection.find('.contact-info');
  if (contactInfo.length) {
    const contactItems = [];
    
    contactInfo.find('.contact-item').each((index, item) => {
      const $item = $(item);
      
      contactItems.push({
        id: `contact-item-${index}`,
        icon: $item.find('.contact-icon').text(),
        title: $item.find('h3').text(),
        value: $item.find('p').text()
      });
    });
    
    content.push({
      id: 'contact-info',
      type: 'contactInfo',
      title: contactInfo.find('.contact-title').text(),
      description: contactInfo.find('.contact-text').text(),
      items: contactItems
    });
  }
  
  // Formulaire de contact
  const contactForm = contactSection.find('.contact-form form');
  if (contactForm.length) {
    const formFields = [];
    
    contactForm.find('.form-group').each((index, group) => {
      const $group = $(group);
      const label = $group.find('label').text();
      const inputType = $group.find('input, textarea').prop('tagName').toLowerCase();
      const inputId = $group.find('input, textarea').attr('id') || '';
      const placeholder = $group.find('input, textarea').attr('placeholder') || '';
      
      formFields.push({
        id: `form-field-${index}`,
        type: inputType === 'textarea' ? 'textarea' : 'input',
        inputType: inputType === 'input' ? $group.find('input').attr('type') || 'text' : 'textarea',
        label,
        placeholder,
        required: false,
        name: inputId
      });
    });
    
    content.push({
      id: 'contact-form',
      type: 'form',
      fields: formFields,
      submitText: contactForm.find('button[type="submit"]').text()
    });
  }
  
  return content;
}

/**
 * Extrait le contenu du pied de page
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Éléments de contenu du pied de page
 */
function extractFooterContent($) {
  const content = [];
  const footerSection = $('.footer');
  
  // Logo footer
  const footerLogo = footerSection.find('.footer-logo');
  if (footerLogo.length) {
    content.push({
      id: 'footer-logo',
      type: 'logo',
      text: footerLogo.text()
    });
  }
  
  // Description
  const footerDesc = footerSection.find('.footer-desc');
  if (footerDesc.length) {
    content.push({
      id: 'footer-description',
      type: 'text',
      content: footerDesc.text()
    });
  }
  
  // Liens sociaux
  const socialLinks = [];
  footerSection.find('.social-link').each((index, link) => {
    const $link = $(link);
    
    socialLinks.push({
      id: `social-link-${index}`,
      icon: $link.text(),
      url: $link.attr('href') || '#'
    });
  });
  
  if (socialLinks.length) {
    content.push({
      id: 'social-links',
      type: 'socialLinks',
      items: socialLinks
    });
  }
  
  // Colonnes de navigation
  const navColumns = [];
  footerSection.find('.footer-nav').each((index, nav) => {
    const $nav = $(nav);
    const heading = $nav.find('.footer-heading').text();
    
    const links = $nav.find('.footer-links li').map((i, li) => {
      const $li = $(li);
      const $a = $li.find('a');
      
      return $a.length ? {
        id: `footer-link-${index}-${i}`,
        label: $a.text(),
        url: $a.attr('href') || '#'
      } : {
        id: `footer-text-${index}-${i}`,
        label: $li.text(),
        isText: true
      };
    }).get();
    
    navColumns.push({
      id: `footer-nav-${index}`,
      heading,
      links
    });
  });
  
  if (navColumns.length) {
    content.push({
      id: 'footer-columns',
      type: 'footerColumns',
      columns: navColumns
    });
  }
  
  // Copyright
  const copyright = footerSection.find('.footer-bottom');
  if (copyright.length) {
    content.push({
      id: 'footer-copyright',
      type: 'copyright',
      text: copyright.text().trim()
    });
  }
  
  return content;
}

/**
 * Extrait les scripts JavaScript
 * @param {Object} $ - Instance Cheerio
 * @returns {Array} - Scripts JavaScript
 */
function extractScripts($) {
  const scripts = [];
  $('script').each((index, script) => {
    const content = $(script).html();
    if (content && !$(script).attr('src')) {
      scripts.push(content);
    }
  });
  
  return scripts;
}

// Exécuter l'extraction de contenu
extractContentFromHTML();