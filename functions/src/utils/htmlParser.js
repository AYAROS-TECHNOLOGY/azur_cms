const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');

/**
 * Analyse un fichier HTML et extrait sa structure pour le CMS
 * @param {string} htmlContent - Le contenu HTML à analyser
 * @returns {Object} Structure JSON du contenu pour le CMS
 */
function parseHtmlPage(htmlContent) {
  const $ = cheerio.load(htmlContent);
  
  // Extraire les métadonnées de base
  const title = $('title').text() || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
  
  // Extraire les variables CSS (couleurs, polices, etc.)
  const styleContent = $('style').html() || '';
  const cssVars = extractCssVars(styleContent);
  
  // Extraire la structure générale de la page
  const structure = {
    title,
    meta: {
      description: metaDescription,
      keywords: metaKeywords
    },
    theme: cssVars,
    sections: []
  };
  
  // Extraire les sections principales (en-tête, héro, services, etc.)
  $('body > header, body > section, body > footer').each((index, element) => {
    const section = {
      id: $(element).attr('id') || `section-${index}`,
      type: element.tagName.toLowerCase(),
      className: $(element).attr('class') || '',
      content: parseSectionContent($, element)
    };
    
    structure.sections.push(section);
  });
  
  // Extraire les scripts pour les animations
  const scripts = [];
  $('script').each((index, element) => {
    if (!$(element).attr('src')) { // Scripts internes uniquement
      scripts.push($(element).html());
    }
  });
  
  structure.scripts = scripts;
  
  return structure;
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
 * Analyse le contenu d'une section
 * @param {Object} $ - Instance Cheerio
 * @param {Object} sectionElement - Élément de section
 * @returns {Array} - Tableau des éléments de contenu
 */
function parseSectionContent($, sectionElement) {
  const elements = [];
  const section = $(sectionElement);
  
  // Traiter selon le type de section
  if (section.hasClass('hero')) {
    parseHeroSection($, section, elements);
  } else if (section.hasClass('services')) {
    parseServicesSection($, section, elements);
  } else if (section.hasClass('philosophy')) {
    parsePhilosophySection($, section, elements);
  } else if (section.hasClass('testimonials')) {
    parseTestimonialsSection($, section, elements);
  } else if (section.hasClass('contact')) {
    parseContactSection($, section, elements);
  } else if (section.is('header')) {
    parseHeaderSection($, section, elements);
  } else if (section.is('footer')) {
    parseFooterSection($, section, elements);
  } else {
    // Section générique
    parseGenericSection($, section, elements);
  }
  
  return elements;
}

/**
 * Analyse une section héro
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section héro
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseHeroSection($, section, elements) {
  const container = section.find('.hero-container');
  
  // Contenu texte héro
  const heroContent = container.find('.hero-content');
  if (heroContent.length) {
    elements.push({
      id: `hero-content-${uuidv4()}`,
      type: 'heroContent',
      title: heroContent.find('.hero-title').text(),
      subtitle: heroContent.find('.hero-subtitle').text(),
      buttonText: heroContent.find('.hero-btn').text(),
      buttonLink: heroContent.find('.hero-btn').attr('href') || '#'
    });
  }
  
  // Image héro
  const heroImage = container.find('.hero-image img');
  if (heroImage.length) {
    elements.push({
      id: `hero-image-${uuidv4()}`,
      type: 'heroImage',
      src: heroImage.attr('src') || '',
      alt: heroImage.attr('alt') || ''
    });
  }
  
  // Arrière-plan
  const bgStyle = section.attr('style') || '';
  const bgImageMatch = bgStyle.match(/background(?:-image)?\s*:\s*url\(['"]?(.*?)['"]?\)/i);
  if (bgImageMatch && bgImageMatch[1]) {
    elements.push({
      id: `hero-background-${uuidv4()}`,
      type: 'background',
      value: bgImageMatch[1]
    });
  }
}

/**
 * Analyse une section services
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section services
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseServicesSection($, section, elements) {
  // Titre de section
  const titleContainer = section.find('.section-title-container');
  if (titleContainer.length) {
    elements.push({
      id: `section-header-${uuidv4()}`,
      type: 'sectionHeader',
      title: titleContainer.find('.section-title').text(),
      subtitle: titleContainer.find('.section-subtitle').text()
    });
  }
  
  // Cartes de services
  const serviceCards = [];
  section.find('.service-card').each((index, card) => {
    const $card = $(card);
    
    serviceCards.push({
      id: `service-${index}-${uuidv4()}`,
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
    elements.push({
      id: `services-container-${uuidv4()}`,
      type: 'servicesContainer',
      items: serviceCards
    });
  }
}

/**
 * Analyse une section philosophie
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section philosophie
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parsePhilosophySection($, section, elements) {
  // Images
  const images = [];
  section.find('.philosophy-img-1, .philosophy-img-2').each((index, img) => {
    images.push({
      id: `philosophy-img-${index}-${uuidv4()}`,
      type: 'image',
      src: $(img).find('img').attr('src') || '',
      alt: $(img).find('img').attr('alt') || '',
      className: $(img).attr('class') || ''
    });
  });
  
  if (images.length) {
    elements.push({
      id: `philosophy-images-${uuidv4()}`,
      type: 'imageGallery',
      items: images
    });
  }
  
  // Contenu texte
  const content = section.find('.philosophy-content');
  if (content.length) {
    elements.push({
      id: `philosophy-content-${uuidv4()}`,
      type: 'richText',
      title: content.find('.philosophy-title').text(),
      paragraphs: content.find('.philosophy-text').map((i, el) => $(el).text()).get()
    });
  }
  
  // Principes
  const principles = [];
  section.find('.principle').each((index, principle) => {
    const $principle = $(principle);
    
    principles.push({
      id: `principle-${index}-${uuidv4()}`,
      type: 'card',
      icon: $principle.find('.principle-icon').text(),
      title: $principle.find('.principle-title').text(),
      description: $principle.find('.principle-desc').text()
    });
  });
  
  if (principles.length) {
    elements.push({
      id: `principles-container-${uuidv4()}`,
      type: 'cardsContainer',
      items: principles
    });
  }
}

/**
 * Analyse une section témoignages
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section témoignages
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseTestimonialsSection($, section, elements) {
  // Titre de section
  const titleContainer = section.find('.section-title-container');
  if (titleContainer.length) {
    elements.push({
      id: `testimonials-header-${uuidv4()}`,
      type: 'sectionHeader',
      title: titleContainer.find('.section-title').text(),
      subtitle: titleContainer.find('.section-subtitle').text()
    });
  }
  
  // Témoignages
  const testimonials = [];
  section.find('.testimonial-card').each((index, card) => {
    const $card = $(card);
    
    testimonials.push({
      id: `testimonial-${index}-${uuidv4()}`,
      type: 'testimonial',
      content: $card.find('.testimonial-content').text(),
      author: {
        name: $card.find('.author-info h3').text(),
        image: $card.find('.author-img img').attr('src') || '',
        rating: $card.find('.stars').text().length
      }
    });
  });
  
  if (testimonials.length) {
    elements.push({
      id: `testimonials-carousel-${uuidv4()}`,
      type: 'testimonialsCarousel',
      items: testimonials
    });
  }
}

/**
 * Analyse une section contact
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section contact
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseContactSection($, section, elements) {
  // Infos de contact
  const contactInfo = section.find('.contact-info');
  if (contactInfo.length) {
    elements.push({
      id: `contact-info-${uuidv4()}`,
      type: 'contactInfo',
      title: contactInfo.find('.contact-title').text(),
      description: contactInfo.find('.contact-text').text(),
      items: contactInfo.find('.contact-item').map((i, item) => {
        const $item = $(item);
        return {
          id: `contact-item-${i}-${uuidv4()}`,
          icon: $item.find('.contact-icon').text(),
          title: $item.find('h3').text(),
          value: $item.find('p').text()
        };
      }).get()
    });
  }
  
  // Formulaire de contact
  const contactForm = section.find('.contact-form form');
  if (contactForm.length) {
    const formFields = [];
    
    contactForm.find('.form-group').each((index, group) => {
      const $group = $(group);
      const label = $group.find('label').text();
      const inputType = $group.find('input, textarea').prop('tagName').toLowerCase();
      const inputId = $group.find('input, textarea').attr('id') || '';
      const placeholder = $group.find('input, textarea').attr('placeholder') || '';
      
      formFields.push({
        id: `form-field-${index}-${uuidv4()}`,
        type: inputType === 'textarea' ? 'textarea' : 'input',
        inputType: inputType === 'input' ? $group.find('input').attr('type') || 'text' : 'textarea',
        label,
        placeholder,
        required: false,
        name: inputId
      });
    });
    
    elements.push({
      id: `contact-form-${uuidv4()}`,
      type: 'form',
      fields: formFields,
      submitText: contactForm.find('button[type="submit"]').text()
    });
  }
}

/**
 * Analyse une section d'en-tête
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section d'en-tête
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseHeaderSection($, section, elements) {
  // Logo
  const logo = section.find('.logo');
  if (logo.length) {
    elements.push({
      id: `header-logo-${uuidv4()}`,
      type: 'logo',
      text: logo.text()
    });
  }
  
  // Menu de navigation
  const navItems = [];
  section.find('.nav-menu li').each((index, item) => {
    const $item = $(item);
    const link = $item.find('a');
    
    navItems.push({
      id: `nav-item-${index}-${uuidv4()}`,
      label: link.text(),
      url: link.attr('href') || '#'
    });
  });
  
  if (navItems.length) {
    elements.push({
      id: `main-navigation-${uuidv4()}`,
      type: 'navigation',
      items: navItems
    });
  }
  
  // Bouton CTA
  const ctaBtn = section.find('.cta-btn');
  if (ctaBtn.length) {
    elements.push({
      id: `header-cta-${uuidv4()}`,
      type: 'button',
      text: ctaBtn.text(),
      url: ctaBtn.attr('href') || '#',
      className: ctaBtn.attr('class') || ''
    });
  }
}

/**
 * Analyse une section de pied de page
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section de pied de page
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseFooterSection($, section, elements) {
  // Logo footer
  const footerLogo = section.find('.footer-logo');
  if (footerLogo.length) {
    elements.push({
      id: `footer-logo-${uuidv4()}`,
      type: 'logo',
      text: footerLogo.text()
    });
  }
  
  // Description
  const footerDesc = section.find('.footer-desc');
  if (footerDesc.length) {
    elements.push({
      id: `footer-description-${uuidv4()}`,
      type: 'text',
      content: footerDesc.text()
    });
  }
  
  // Liens sociaux
  const socialLinks = [];
  section.find('.social-link').each((index, link) => {
    const $link = $(link);
    
    socialLinks.push({
      id: `social-link-${index}-${uuidv4()}`,
      icon: $link.text(),
      url: $link.attr('href') || '#'
    });
  });
  
  if (socialLinks.length) {
    elements.push({
      id: `social-links-${uuidv4()}`,
      type: 'socialLinks',
      items: socialLinks
    });
  }
  
  // Colonnes de navigation
  const navColumns = [];
  section.find('.footer-nav').each((index, nav) => {
    const $nav = $(nav);
    const heading = $nav.find('.footer-heading').text();
    
    const links = $nav.find('.footer-links li').map((i, li) => {
      const $li = $(li);
      const $a = $li.find('a');
      
      return $a.length ? {
        id: `footer-link-${index}-${i}-${uuidv4()}`,
        label: $a.text(),
        url: $a.attr('href') || '#'
      } : {
        id: `footer-text-${index}-${i}-${uuidv4()}`,
        label: $li.text(),
        isText: true
      };
    }).get();
    
    navColumns.push({
      id: `footer-nav-${index}-${uuidv4()}`,
      heading,
      links
    });
  });
  
  if (navColumns.length) {
    elements.push({
      id: `footer-columns-${uuidv4()}`,
      type: 'footerColumns',
      columns: navColumns
    });
  }
  
  // Copyright
  const copyright = section.find('.footer-bottom');
  if (copyright.length) {
    elements.push({
      id: `footer-copyright-${uuidv4()}`,
      type: 'copyright',
      text: copyright.text().trim()
    });
  }
}

/**
 * Analyse une section générique
 * @param {Object} $ - Instance Cheerio
 * @param {Object} section - Section générique
 * @param {Array} elements - Tableau des éléments à remplir
 */
function parseGenericSection($, section, elements) {
  // Pour les sections non spécialisées, extraire le contenu de manière plus générique
  
  // Titres
  section.find('h1, h2, h3, h4, h5, h6').each((index, heading) => {
    elements.push({
      id: `heading-${index}-${uuidv4()}`,
      type: 'heading',
      level: parseInt(heading.tagName.substring(1), 10),
      text: $(heading).text(),
      className: $(heading).attr('class') || ''
    });
  });
  
  // Paragraphes
  section.find('p').each((index, paragraph) => {
    elements.push({
      id: `paragraph-${index}-${uuidv4()}`,
      type: 'paragraph',
      text: $(paragraph).text(),
      className: $(paragraph).attr('class') || ''
    });
  });
  
  // Images
  section.find('img').each((index, img) => {
    elements.push({
      id: `image-${index}-${uuidv4()}`,
      type: 'image',
      src: $(img).attr('src') || '',
      alt: $(img).attr('alt') || '',
      className: $(img).attr('class') || ''
    });
  });
  
  // Boutons
  section.find('button, a.btn, .button').each((index, button) => {
    elements.push({
      id: `button-${index}-${uuidv4()}`,
      type: 'button',
      text: $(button).text(),
      url: $(button).attr('href') || '#',
      className: $(button).attr('class') || ''
    });
  });
}

/**
 * Génère le HTML à partir d'une structure JSON
 * @param {Object} structure - Structure JSON du contenu
 * @returns {string} - Code HTML généré
 */
function generateHtmlFromStructure(structure) {
  // Créer le HTML de base
  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structure.title || 'Ayurveda Équilibre'}</title>
    <meta name="description" content="${structure.meta?.description || ''}">
    <meta name="keywords" content="${structure.meta?.keywords || ''}">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --color-primary: ${structure.theme?.colors?.primary || '#0a4b44'};
            --color-accent: ${structure.theme?.colors?.accent || '#d4a039'};
            --color-light: ${structure.theme?.colors?.light || '#f9f5f0'};
            --color-dark: ${structure.theme?.colors?.dark || '#1f332e'};
            --color-neutral: ${structure.theme?.colors?.neutral || '#e6e0d4'};
            --font-heading: ${structure.theme?.fonts?.heading || "'Cormorant Garamond', serif"};
            --font-body: ${structure.theme?.fonts?.body || "'Montserrat', sans-serif"};
        }
        
        body {
            font-family: var(--font-body);
            color: var(--color-dark);
            background-color: var(--color-light);
            overflow-x: hidden;
            position: relative;
        }
        
        /* Curseur personnalisé subtil */
        .custom-cursor {
            position: fixed;
            width: 20px;
            height: 20px;
            border: 1px solid var(--color-primary);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s;
            z-index: 9999;
            opacity: 0.7;
        }
        
        .custom-cursor.expand {
            width: 40px;
            height: 40px;
            background-color: rgba(10, 75, 68, 0.05);
        }
        
        /* Formes organiques de fond */
        .bg-shape {
            position: absolute;
            z-index: -1;
            pointer-events: none;
        }
        
        .shape-1 {
            top: -10%;
            right: -5%;
            width: 50%;
            opacity: 0.1;
        }
        
        .shape-2 {
            bottom: 30%;
            left: -10%;
            width: 40%;
            opacity: 0.1;
        }
        
        /* En-tête organique avec menu */
        .header {
            padding: 2rem 0;
            position: relative;
            width: 100%;
            z-index: 10;
        }
        
        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: var(--color-primary);
            position: relative;
        }
        
        .logo::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 40px;
            height: 2px;
            background-color: var(--color-accent);
        }
        
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2.5rem;
        }
        
        .nav-menu li a {
            text-decoration: none;
            color: var(--color-dark);
            font-size: 0.95rem;
            letter-spacing: 0.5px;
            position: relative;
            padding-bottom: 5px;
            transition: color 0.3s;
        }
        
        .nav-menu li a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 1px;
            background-color: var(--color-accent);
            transition: width 0.3s ease;
        }
        
        .nav-menu li a:hover {
            color: var(--color-primary);
        }
        
        .nav-menu li a:hover::after {
            width: 100%;
        }
        
        .cta-btn {
            background-color: var(--color-primary);
            color: white;
            border: none;
            padding: 0.8rem 1.8rem;
            font-family: var(--font-body);
            font-size: 0.9rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }
        
        .cta-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background-color: var(--color-accent);
            transition: all 0.4s ease;
            z-index: -1;
        }
        
        .cta-btn:hover::before {
            left: 0;
        }
        
        .mobile-toggle {
            display: none;
            cursor: pointer;
            width: 30px;
            height: 20px;
            position: relative;
            z-index: 20;
        }
        
        .mobile-toggle span {
            display: block;
            position: absolute;
            height: 2px;
            width: 100%;
            background: var(--color-primary);
            transition: all 0.3s ease;
        }
        
        .mobile-toggle span:nth-child(1) {
            top: 0;
        }
        
        .mobile-toggle span:nth-child(2) {
            top: 9px;
        }
        
        .mobile-toggle span:nth-child(3) {
            top: 18px;
        }
        
        /* Section héro organique et fluide */
        .hero {
            height: 90vh;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
            margin-top: -80px;
            padding-top: 80px;
            clip-path: ellipse(120% 100% at 50% 0%);
            background: linear-gradient(to bottom, rgba(10, 75, 68, 0.9), rgba(10, 75, 68, 0.8)), url('https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80');
            background-size: cover;
            background-position: center;
        }
        
        .hero-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
        }
        
        .hero-content {
            flex: 1;
            color: white;
            max-width: 600px;
            position: relative;
        }
        
        .hero-title {
            font-family: var(--font-heading);
            font-size: 4.5rem;
            font-weight: 300;
            line-height: 1.1;
            margin-bottom: 1.5rem;
        }
        
        .hero-subtitle {
            font-size: 1.1rem;
            font-weight: 300;
            margin-bottom: 2.5rem;
            opacity: 0.9;
        }
        
        .hero-btn {
            display: inline-block;
            background-color: var(--color-accent);
            color: var(--color-dark);
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-size: 1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .hero-btn:hover {
            background-color: white;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .hero-image {
            flex: 1;
            position: relative;
        }
        
        .hero-img-shape {
            position: relative;
            width: 100%;
            height: 500px;
            border-radius: 63% 37% 54% 46% / 55% 52% 48% 45%;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }
        
        .hero-img-shape img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .hero-img-shape:hover {
            border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
        }
        
        /* Pied de page */
        .footer {
            padding: 5rem 0 2rem;
            position: relative;
            overflow: hidden;
            background-color: var(--color-primary);
            color: white;
        }
        
        .footer-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .footer-top {
            display: flex;
            flex-wrap: wrap;
            gap: 3rem;
            margin-bottom: 4rem;
        }
        
        .footer-info {
            flex: 2;
            min-width: 300px;
        }
        
        .footer-logo {
            font-family: var(--font-heading);
            font-size: 2rem;
            color: white;
            margin-bottom: 1.5rem;
        }
        
        .footer-desc {
            max-width: 400px;
            margin-bottom: 2rem;
            line-height: 1.7;
            opacity: 0.8;
        }
        
        .footer-social {
            display: flex;
            gap: 1rem;
        }
        
        .social-link {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .social-link:hover {
            background-color: var(--color-accent);
            transform: translateY(-3px);
        }
        
        .footer-nav {
            flex: 1;
            min-width: 150px;
        }
        
        .footer-heading {
            font-family: var(--font-heading);
            font-size: 1.3rem;
            color: white;
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .footer-heading::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 40px;
            height: 2px;
            background-color: var(--color-accent);
        }
        
        .footer-links {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }
        
        .footer-links li a {
            color: white;
            text-decoration: none;
            opacity: 0.8;
            transition: all 0.3s ease;
        }
        
        .footer-links li a:hover {
            opacity: 1;
            transform: translateX(5px);
        }
        
        .footer-bottom {
            padding-top: 2rem;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            opacity: 0.7;
            font-size: 0.9rem;
        }
        
        /* Responsive */
        @media (max-width: 992px) {
            .hero-container {
                flex-direction: column;
                gap: 3rem;
            }
            
            .hero-content {
                text-align: center;
                max-width: 100%;
            }
            
            .hero-title {
                font-size: 3.5rem;
            }
            
            .footer-top {
                flex-direction: column;
                gap: 2rem;
            }
        }
        
        @media (max-width: 768px) {
            .header {
                padding: 1.5rem 0;
            }
            
            .nav-menu {
                position: fixed;
                top: 0;
                right: -100%;
                width: 80%;
                max-width: 400px;
                height: 100vh;
                background-color: white;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2rem;
                transition: all 0.5s ease;
                z-index: 15;
                box-shadow: -10px 0 30px rgba(0,0,0,0.1);
            }
            
            .nav-menu.active {
                right: 0;
            }
            
            .mobile-toggle {
                display: block;
            }
            
            .hero {
                height: auto;
                padding: 6rem 0 4rem;
            }
            
            .hero-title {
                font-size: 3rem;
            }
        }
    </style>
</head>
<body>
`;
  
  // Générer les sections
  if (structure.sections && structure.sections.length > 0) {
    structure.sections.forEach(section => {
      switch (section.type) {
        case 'header':
          html += generateHeaderHtml(section);
          break;
        case 'section':
          if (section.className.includes('hero')) {
            html += generateHeroHtml(section);
          } else if (section.className.includes('services')) {
            html += generateServicesHtml(section);
          } else if (section.className.includes('philosophy')) {
            html += generatePhilosophyHtml(section);
          } else if (section.className.includes('testimonials')) {
            html += generateTestimonialsHtml(section);
          } else if (section.className.includes('contact')) {
            html += generateContactHtml(section);
          } else {
            html += generateGenericSectionHtml(section);
          }
          break;
        case 'footer':
          html += generateFooterHtml(section);
          break;
        default:
          html += `<div class="${section.className}">${section.type}</div>`;
      }
    });
  }
  
  // Ajouter les scripts et fermer le HTML
  html += `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Fonctionnalités JavaScript
        });
    </script>
</body>
</html>`;
  
  return html;
}

/**
 * Génère le HTML pour l'en-tête
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateHeaderHtml(section) {
  let html = `<header class="${section.className}">
    <div class="nav-container">`;
  
  if (section.content && section.content.length > 0) {
    // Logo
    const logoElement = section.content.find(e => e.type === 'logo');
    if (logoElement) {
      html += `
        <div class="logo">${logoElement.text}</div>`;
    }
    
    // Navigation
    const navElement = section.content.find(e => e.type === 'navigation');
    if (navElement && navElement.items && navElement.items.length > 0) {
      html += `
        <ul class="nav-menu">`;
      
      navElement.items.forEach(item => {
        html += `
            <li><a href="${item.url}">${item.label}</a></li>`;
      });
      
      html += `
        </ul>`;
    }
    
    // Bouton CTA
    const buttonElement = section.content.find(e => e.type === 'button');
    if (buttonElement) {
      html += `
        <button class="${buttonElement.className}">${buttonElement.text}</button>`;
    }
    
    // Toggle mobile
    html += `
        <div class="mobile-toggle">
            <span></span>
            <span></span>
            <span></span>
        </div>`;
  } else {
    // Contenu par défaut si aucun élément n'est défini
    html += `
        <div class="logo">Ayurveda Équilibre</div>
        <ul class="nav-menu">
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#services">Soins</a></li>
            <li><a href="#philosophy">Philosophie</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <button class="cta-btn">Prendre RDV</button>
        <div class="mobile-toggle">
            <span></span>
            <span></span>
            <span></span>
        </div>`;
  }
  
  html += `
    </div>
</header>`;
  
  return html;
}

/**
 * Génère le HTML pour la section héro
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateHeroHtml(section) {
  let html = `<section id="${section.id}" class="${section.className}">
    <div class="hero-pattern"></div>
    <div class="hero-container">`;
  
  if (section.content && section.content.length > 0) {
    // Contenu héro
    const heroContent = section.content.find(e => e.type === 'heroContent');
    if (heroContent) {
      html += `
        <div class="hero-content">
            <h1 class="hero-title">${heroContent.title}</h1>
            <p class="hero-subtitle">${heroContent.subtitle}</p>
            <button class="hero-btn">${heroContent.buttonText}</button>
        </div>`;
    }
    
    // Image héro
    const heroImage = section.content.find(e => e.type === 'heroImage');
    if (heroImage) {
      html += `
        <div class="hero-image">
            <div class="hero-img-shape">
                <img src="${heroImage.src}" alt="${heroImage.alt || ''}">
            </div>
        </div>`;
    }
  } else {
    // Contenu par défaut
    html += `
        <div class="hero-content">
            <h1 class="hero-title">Retrouvez l'harmonie naturelle</h1>
            <p class="hero-subtitle">Découvrez les bienfaits millénaires de l'Ayurveda pour équilibrer votre corps et votre esprit</p>
            <button class="hero-btn">Découvrir nos soins</button>
        </div>
        <div class="hero-image">
            <div class="hero-img-shape">
                <img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Ayurvedic treatment">
            </div>
        </div>`;
  }
  
  html += `
    </div>
</section>`;
  
  return html;
}

/**
 * Génère le HTML pour les sections génériques
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateGenericSectionHtml(section) {
  let html = `<section id="${section.id}" class="${section.className}">
    <div class="container">`;
  
  if (section.content && section.content.length > 0) {
    section.content.forEach(element => {
      switch (element.type) {
        case 'heading':
          html += `
        <h${element.level || 2} class="${element.className || ''}">${element.text}</h${element.level || 2}>`;
          break;
        case 'paragraph':
          html += `
        <p class="${element.className || ''}">${element.text}</p>`;
          break;
        case 'image':
          html += `
        <img src="${element.src}" alt="${element.alt || ''}" class="${element.className || ''}">`;
          break;
        case 'button':
          html += `
        <button class="${element.className || ''}">${element.text}</button>`;
          break;
        default:
          html += `
        <div class="${element.type}">${JSON.stringify(element)}</div>`;
      }
    });
  } else {
    html += `
        <h2>Contenu à définir</h2>
        <p>Cette section n'a pas encore de contenu défini.</p>`;
  }
  
  html += `
    </div>
</section>`;
  
  return html;
}

/**
 * Génère le HTML pour la section des services
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateServicesHtml(section) {
  // Implémentation du générateur de services (simplifié pour l'exemple)
  return `<section id="${section.id}" class="${section.className}">
    <div class="container">
        <!-- Contenu de la section services -->
    </div>
</section>`;
}

/**
 * Génère le HTML pour la section de philosophie
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generatePhilosophyHtml(section) {
  // Implémentation du générateur de philosophie (simplifié pour l'exemple)
  return `<section id="${section.id}" class="${section.className}">
    <div class="container">
        <!-- Contenu de la section philosophie -->
    </div>
</section>`;
}

/**
 * Génère le HTML pour la section des témoignages
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateTestimonialsHtml(section) {
  // Implémentation du générateur de témoignages (simplifié pour l'exemple)
  return `<section id="${section.id}" class="${section.className}">
    <div class="container">
        <!-- Contenu de la section témoignages -->
    </div>
</section>`;
}

/**
 * Génère le HTML pour la section de contact
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateContactHtml(section) {
  // Implémentation du générateur de contact (simplifié pour l'exemple)
  return `<section id="${section.id}" class="${section.className}">
    <div class="container">
        <!-- Contenu de la section contact -->
    </div>
</section>`;
}

/**
 * Génère le HTML pour le pied de page
 * @param {Object} section - Données de la section
 * @returns {string} - HTML généré
 */
function generateFooterHtml(section) {
  let html = `<footer class="${section.className}">
    <div class="footer-container">
        <div class="footer-top">`;
  
  if (section.content && section.content.length > 0) {
    // Logo et description
    const logoElement = section.content.find(e => e.type === 'logo');
    const descElement = section.content.find(e => e.type === 'text');
    
    if (logoElement || descElement) {
      html += `
            <div class="footer-info">`;
      
      if (logoElement) {
        html += `
                <div class="footer-logo">${logoElement.text}</div>`;
      }
      
      if (descElement) {
        html += `
                <p class="footer-desc">${descElement.content}</p>`;
      }
      
      html += `
            </div>`;
    }
    
    // Liens sociaux
    const socialLinks = section.content.find(e => e.type === 'socialLinks');
    if (socialLinks && socialLinks.items && socialLinks.items.length > 0) {
      html += `
            <div class="footer-social">`;
      
      socialLinks.items.forEach(link => {
        html += `
                <a href="${link.url}" class="social-link">${link.icon}</a>`;
      });
      
      html += `
            </div>`;
    }
    
    // Colonnes de navigation
    const footerColumns = section.content.find(e => e.type === 'footerColumns');
    if (footerColumns && footerColumns.columns && footerColumns.columns.length > 0) {
      footerColumns.columns.forEach(column => {
        html += `
            <div class="footer-nav">
                <h3 class="footer-heading">${column.heading}</h3>
                <ul class="footer-links">`;
        
        if (column.links && column.links.length > 0) {
          column.links.forEach(link => {
            if (link.isText) {
              html += `
                    <li>${link.label}</li>`;
            } else {
              html += `
                    <li><a href="${link.url}">${link.label}</a></li>`;
            }
          });
        }
        
        html += `
                </ul>
            </div>`;
      });
    }
  } else {
    // Contenu par défaut
    html += `
            <div class="footer-info">
                <div class="footer-logo">Ayurveda Équilibre</div>
                <p class="footer-desc">Un espace dédié à l'équilibre holistique où la sagesse ancestrale rencontre le bien-être moderne.</p>
            </div>
            <div class="footer-nav">
                <h3 class="footer-heading">Navigation</h3>
                <ul class="footer-links">
                    <li><a href="#accueil">Accueil</a></li>
                    <li><a href="#services">Soins</a></li>
                    <li><a href="#philosophy">Philosophie</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </div>`;
  }
  
  html += `
        </div>
        
        <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} Ayurveda Équilibre. Tous droits réservés.</p>
        </div>
    </div>
</footer>`;
  
  return html;
}

module.exports = {
  parseHtmlPage,
  generateHtmlFromStructure
};