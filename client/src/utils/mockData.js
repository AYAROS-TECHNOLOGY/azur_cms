/**
 * This file provides mock data for the application when the API server is not available
 * This allows for development and testing without a backend
 */

// Mock site structure
export const mockSiteStructure = {
    pages: [
      {
        id: 'home',
        title: 'Accueil',
        path: '/',
        template: 'home',
        isPublished: true,
        lastUpdated: '2025-03-18T10:30:00Z',
        author: 'Admin'
      },
      {
        id: 'about',
        title: 'À propos',
        path: '/a-propos',
        template: 'default',
        isPublished: true,
        lastUpdated: '2025-03-15T14:20:00Z',
        author: 'Admin'
      },
      {
        id: 'services',
        title: 'Nos services',
        path: '/services',
        template: 'default',
        isPublished: false,
        lastUpdated: '2025-03-10T09:15:00Z',
        author: 'Admin'
      },
      {
        id: 'contact',
        title: 'Contact',
        path: '/contact',
        template: 'contact',
        isPublished: true,
        lastUpdated: '2025-03-05T16:45:00Z',
        author: 'Admin'
      }
    ],
    navigation: {
      main: [
        { id: 'home', label: 'Accueil', path: '/' },
        { id: 'about', label: 'À propos', path: '/a-propos' },
        { id: 'services', label: 'Services', path: '/services' },
        { id: 'contact', label: 'Contact', path: '/contact' }
      ]
    }
  };
  
  // Mock page content
  export const mockPages = {
    home: {
      title: "Ayurveda Équilibre",
      meta: {
        description: "Centre de bien-être ayurvédique pour retrouver l'harmonie naturelle",
        keywords: "ayurveda, massage, bien-être, soins, équilibre"
      },
      sections: [
        {
          id: "header",
          type: "header",
          className: "header",
          content: [
            {
              id: "header-logo",
              type: "logo",
              text: "Ayurveda Équilibre"
            },
            {
              id: "main-navigation",
              type: "navigation",
              items: [
                {
                  id: "nav-item-home",
                  label: "Accueil",
                  url: "#accueil"
                },
                {
                  id: "nav-item-services",
                  label: "Soins",
                  url: "#services"
                },
                {
                  id: "nav-item-philosophy",
                  label: "Philosophie",
                  url: "#philosophy"
                },
                {
                  id: "nav-item-testimonials",
                  label: "Témoignages",
                  url: "#testimonials"
                },
                {
                  id: "nav-item-contact",
                  label: "Contact",
                  url: "#contact"
                }
              ]
            },
            {
              id: "header-cta",
              type: "button",
              text: "Prendre RDV",
              url: "#contact",
              className: "cta-btn"
            }
          ]
        },
        {
          id: "hero",
          type: "section",
          className: "hero",
          content: [
            {
              id: "hero-content",
              type: "heroContent",
              title: "Retrouvez l'harmonie naturelle",
              subtitle: "Découvrez les bienfaits millénaires de l'Ayurveda pour équilibrer votre corps et votre esprit",
              buttonText: "Découvrir nos soins",
              buttonLink: "#services"
            },
            {
              id: "hero-image",
              type: "heroImage",
              src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
              alt: "Ayurvedic treatment"
            }
          ]
        },
        {
          id: "footer",
          type: "footer",
          className: "footer",
          content: [
            {
              id: "footer-logo",
              type: "logo",
              text: "Ayurveda Équilibre"
            },
            {
              id: "footer-description",
              type: "text",
              content: "Un espace dédié à l'équilibre holistique où la sagesse ancestrale rencontre le bien-être moderne."
            },
            {
              id: "footer-copyright",
              type: "copyright",
              text: "© 2025 Ayurveda Équilibre. Tous droits réservés."
            }
          ]
        }
      ]
    }
  };
  
  // Mock media files
  export const mockMediaFiles = [
    {
      name: "images/hero-image.jpg",
      url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      contentType: "image/jpeg",
      size: 245678,
      uploadedAt: "2025-03-10T08:30:45Z",
      uploadedBy: "admin"
    },
    {
      name: "images/massage.jpg",
      url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      contentType: "image/jpeg",
      size: 198432,
      uploadedAt: "2025-03-12T14:22:10Z",
      uploadedBy: "admin"
    },
    {
      name: "images/oils.jpg",
      url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      contentType: "image/jpeg",
      size: 176543,
      uploadedAt: "2025-03-15T11:45:22Z",
      uploadedBy: "admin"
    },
    {
      name: "images/herbs.jpg",
      url: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      contentType: "image/jpeg",
      size: 220145,
      uploadedAt: "2025-03-18T09:12:36Z",
      uploadedBy: "admin"
    }
  ];
  
  // Mock theme
  export const mockTheme = {
    id: "default",
    name: "Ayurveda Équilibre",
    colors: {
      primary: "#0a4b44",
      accent: "#d4a039",
      light: "#f9f5f0",
      dark: "#1f332e",
      neutral: "#e6e0d4"
    },
    fonts: {
      heading: "'Cormorant Garamond', serif",
      body: "'Montserrat', sans-serif"
    }
  };
  
  // Mock versions
  export const mockVersions = [
    {
      file: "pages/home.json-2025-03-20T15:45:22Z",
      timestamp: "2025-03-20T15:45:22Z",
      user: "admin"
    },
    {
      file: "active-theme.json-2025-03-18T09:30:15Z",
      timestamp: "2025-03-18T09:30:15Z",
      user: "admin"
    },
    {
      file: "pages/about.json-2025-03-15T14:22:36Z",
      timestamp: "2025-03-15T14:22:36Z",
      user: "admin"
    },
    {
      file: "structure.json-2025-03-10T11:05:42Z",
      timestamp: "2025-03-10T11:05:42Z",
      user: "admin"
    }
  ];