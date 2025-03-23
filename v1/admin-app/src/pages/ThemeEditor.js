import React, { useState } from 'react';

const ThemeEditor = () => {
  // État du thème
  const [theme, setTheme] = useState({
    name: 'Thème principal',
    description: 'Thème par défaut du site',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif'
    },
    customCSS: `/* Variables */
:root {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --color-background: #FFFFFF;
  --color-text: #1F2937;
  --font-heading: Poppins, sans-serif;
  --font-body: Inter, sans-serif;
}

/* Base styles */
body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.accent {
  color: var(--color-accent);
}`,
    isActive: true
  });
  
  // Prévisualisation des éléments
  const previewElements = [
    { name: 'Titre principal', element: 'h1', content: 'Titre principal', className: '' },
    { name: 'Sous-titre', element: 'h2', content: 'Sous-titre', className: '' },
    { name: 'Paragraphe', element: 'p', content: 'Ceci est un exemple de texte pour voir comment se comporte le style de paragraphe avec le thème actuel.', className: '' },
    { name: 'Bouton primaire', element: 'button', content: 'Bouton primaire', className: 'btn-primary p-2 rounded' },
    { name: 'Bouton secondaire', element: 'button', content: 'Bouton secondaire', className: 'btn-secondary p-2 rounded' },
    { name: 'Lien', element: 'a', content: 'Ceci est un lien', className: 'text-blue-500' },
    { name: 'Texte accent', element: 'span', content: 'Texte avec accent', className: 'accent' }
  ];
  
  // Gestion des changements de couleur
  const handleColorChange = (colorKey, value) => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: value
      }
    });
    
    // Mettre à jour le CSS personnalisé
    updateCustomCSS(colorKey, value);
  };
  
  // Gestion des changements de police
  const handleFontChange = (fontKey, value) => {
    setTheme({
      ...theme,
      fonts: {
        ...theme.fonts,
        [fontKey]: value
      }
    });
    
    // Mettre à jour le CSS personnalisé
    updateCustomCSS(fontKey, value, true);
  };
  
  // Mise à jour du CSS personnalisé
  const updateCustomCSS = (key, value, isFont = false) => {
    const cssVarName = isFont 
      ? `--font-${key}`
      : `--color-${key}`;
    
    const regex = new RegExp(`${cssVarName}: .*?;`);
    const newCSS = theme.customCSS.replace(regex, `${cssVarName}: ${value};`);
    
    setTheme({
      ...theme,
      customCSS: newCSS
    });
  };
  
  // Générer le style pour la prévisualisation
  const getPreviewStyle = () => {
    return {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-accent': theme.colors.accent,
      '--color-background': theme.colors.background,
      '--color-text': theme.colors.text,
      '--font-heading': theme.fonts.heading,
      '--font-body': theme.fonts.body,
    };
  };
  
  // Liste des polices disponibles
  const fontOptions = [
    'Inter, sans-serif',
    'Poppins, sans-serif',
    'Roboto, sans-serif',
    'Montserrat, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Raleway, sans-serif',
    'Playfair Display, serif',
    'Merriweather, serif',
    'Georgia, serif'
  ];

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Éditeur de thème</h1>
        <div>
          <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-2">
            Enregistrer
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Exporter
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paramètres du thème */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Paramètres du thème</h2>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nom du thème</label>
                <input 
                  type="text" 
                  value={theme.name} 
                  onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Description</label>
                <textarea 
                  value={theme.description} 
                  onChange={(e) => setTheme({ ...theme, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="2"
                />
              </div>
              
              {/* Couleurs */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-2">Couleurs</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Couleur primaire</label>
                    <div className="flex">
                      <input 
                        type="color" 
                        value={theme.colors.primary} 
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="h-10 w-12 border rounded-l"
                      />
                      <input 
                        type="text" 
                        value={theme.colors.primary} 
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-3 py-2 border-t border-r border-b rounded-r"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Couleur secondaire</label>
                    <div className="flex">
                      <input 
                        type="color" 
                        value={theme.colors.secondary} 
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="h-10 w-12 border rounded-l"
                      />
                      <input 
                        type="text" 
                        value={theme.colors.secondary} 
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="flex-1 px-3 py-2 border-t border-r border-b rounded-r"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Couleur d'accent</label>
                    <div className="flex">
                      <input 
                        type="color" 
                        value={theme.colors.accent} 
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="h-10 w-12 border rounded-l"
                      />
                      <input 
                        type="text" 
                        value={theme.colors.accent} 
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 px-3 py-2 border-t border-r border-b rounded-r"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Couleur d'arrière-plan</label>
                    <div className="flex">
                      <input 
                        type="color" 
                        value={theme.colors.background} 
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="h-10 w-12 border rounded-l"
                      />
                      <input 
                        type="text" 
                        value={theme.colors.background} 
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 px-3 py-2 border-t border-r border-b rounded-r"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Couleur de texte</label>
                    <div className="flex">
                      <input 
                        type="color" 
                        value={theme.colors.text} 
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="h-10 w-12 border rounded-l"
                      />
                      <input 
                        type="text" 
                        value={theme.colors.text} 
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="flex-1 px-3 py-2 border-t border-r border-b rounded-r"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Polices */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-2">Polices</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Police des titres</label>
                    <select 
                      value={theme.fonts.heading} 
                      onChange={(e) => handleFontChange('heading', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font.split(',')[0]}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Police du corps</label>
                    <select 
                      value={theme.fonts.body} 
                      onChange={(e) => handleFontChange('body', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font}>{font.split(',')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Prévisualisation du thème */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Prévisualisation</h2>
            
            {/* Conteneur de prévisualisation */}
            <div 
              className="p-4 border rounded"
              style={{
                ...getPreviewStyle(),
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)'
              }}
            >
              {previewElements.map((item, index) => {
                const Element = item.element;
                return (
                  <div key={index} className="mb-4">
                    <small className="block text-xs text-gray-500 mb-1">{item.name}</small>
                    <Element 
                      className={item.className}
                      style={
                        Element === 'h1' || Element === 'h2' || Element === 'h3' 
                          ? { fontFamily: 'var(--font-heading)' } 
                          : {}
                      }
                    >
                      {item.content}
                    </Element>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* CSS personnalisé */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">CSS personnalisé</h2>
            
            <textarea 
              value={theme.customCSS} 
              onChange={(e) => setTheme({ ...theme, customCSS: e.target.value })}
              className="w-full px-3 py-2 border rounded h-96 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;