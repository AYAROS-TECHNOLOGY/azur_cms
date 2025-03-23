import React, { useState } from 'react';

const PageEditor = () => {
  // État pour les propriétés de base de la page
  const [pageTitle, setPageTitle] = useState('Page d\'accueil');
  const [pageSlug, setPageSlug] = useState('accueil');
  const [pageDescription, setPageDescription] = useState('Bienvenue sur notre site');
  
  // État pour les blocs de contenu
  const [blocks, setBlocks] = useState([
    {
      id: 1,
      type: 'text',
      name: 'Hero Heading',
      content: '<h1>Bienvenue sur notre site</h1><p>Découvrez nos services de qualité.</p>',
      styles: { color: '#333333', backgroundColor: 'transparent', padding: '20px' },
      animation: 'fade-in',
      position: { x: 0, y: 0, width: 12, height: 2 }
    },
    {
      id: 2,
      type: 'image',
      name: 'Hero Image',
      content: { src: '/placeholder/800/400', alt: 'Bannière principale' },
      styles: { borderRadius: '8px', margin: '20px 0' },
      animation: 'slide-in-right',
      position: { x: 0, y: 2, width: 12, height: 4 }
    }
  ]);
  
  // État pour le bloc sélectionné
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const selectedBlock = blocks.find(block => block.id === selectedBlockId);
  
  // Ajout d'un nouveau bloc
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      name: `Nouveau bloc ${type}`,
      content: type === 'text' ? '<p>Nouveau contenu</p>' : 
               type === 'image' ? { src: '/placeholder/400/300', alt: 'Image' } :
               type === 'video' ? { src: 'https://example.com/video.mp4' } : '',
      styles: {},
      animation: 'none',
      position: { x: 0, y: blocks.reduce((max, block) => Math.max(max, block.position.y + block.position.height), 0), width: 12, height: 2 }
    };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };
  
  // Mise à jour d'un bloc
  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };
  
  // Suppression d'un bloc
  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barre latérale avec les outils */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Éditeur de page</h2>
        </div>
        
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ajouter un élément</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addBlock('text')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded text-sm"
            >
              Texte
            </button>
            <button 
              onClick={() => addBlock('image')}
              className="bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded text-sm"
            >
              Image
            </button>
            <button 
              onClick={() => addBlock('video')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-3 rounded text-sm"
            >
              Vidéo
            </button>
            <button 
              onClick={() => addBlock('form')}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-3 rounded text-sm"
            >
              Formulaire
            </button>
          </div>
        </div>
        
        {/* Propriétés de la page */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Propriétés de la page</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Titre</label>
              <input 
                type="text" 
                value={pageTitle} 
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input 
                type="text" 
                value={pageSlug} 
                onChange={(e) => setPageSlug(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea 
                value={pageDescription} 
                onChange={(e) => setPageDescription(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
                rows="2"
              />
            </div>
          </div>
        </div>
        
        {/* Liste des blocs */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Blocs</h3>
          <div className="space-y-2">
            {blocks.map(block => (
              <div 
                key={block.id} 
                className={`p-2 border rounded cursor-pointer ${selectedBlockId === block.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedBlockId(block.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{block.name}</div>
                  <div className="text-xs bg-gray-200 px-1 rounded">{block.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Zone principale de prévisualisation */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-bold">{pageTitle || 'Sans titre'}</h1>
              <div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded mr-2">
                  Enregistrer
                </button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-4 rounded">
                  Publier
                </button>
              </div>
            </div>
            
            {/* Prévisualisation de la page */}
            <div className="border rounded p-4 bg-gray-50 min-h-screen">
              <div className="grid grid-cols-12 gap-4">
                {blocks.map(block => (
                  <div 
                    key={block.id}
                    className={`col-span-${block.position.width} border ${selectedBlockId === block.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    style={{
                      minHeight: `${block.position.height * 50}px`,
                      ...block.styles
                    }}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    {block.type === 'text' && (
                      <div dangerouslySetInnerHTML={{ __html: block.content }} />
                    )}
                    {block.type === 'image' && (
                      <img src="/api/placeholder/400/300" alt={block.content.alt} className="w-full h-auto" />
                    )}
                    {block.type === 'video' && (
                      <div className="bg-black text-white text-center p-8">
                        [Prévisualisation Vidéo]
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Panneau de propriétés du bloc sélectionné */}
      {selectedBlock && (
        <div className="w-80 bg-white shadow-md overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Propriétés du bloc</h2>
              <button 
                onClick={() => deleteBlock(selectedBlock.id)}
                className="text-red-500 hover:text-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nom</label>
              <input 
                type="text" 
                value={selectedBlock.name} 
                onChange={(e) => updateBlock(selectedBlock.id, { name: e.target.value })}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            
            {selectedBlock.type === 'text' && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Contenu</label>
                <textarea 
                  value={selectedBlock.content} 
                  onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                  className="w-full px-2 py-1 border rounded"
                  rows="4"
                />
              </div>
            )}
            
            {selectedBlock.type === 'image' && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">URL de l'image</label>
                <input 
                  type="text" 
                  value={selectedBlock.content.src} 
                  onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, src: e.target.value } })}
                  className="w-full px-2 py-1 border rounded mb-2"
                />
                <label className="block text-sm text-gray-500 mb-1">Texte alternatif</label>
                <input 
                  type="text" 
                  value={selectedBlock.content.alt} 
                  onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, alt: e.target.value } })}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Animation</label>
              <select
                value={selectedBlock.animation}
                onChange={(e) => updateBlock(selectedBlock.id, { animation: e.target.value })}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="none">Aucune</option>
                <option value="fade-in">Fondu</option>
                <option value="slide-in-left">Glisser depuis la gauche</option>
                <option value="slide-in-right">Glisser depuis la droite</option>
                <option value="zoom-in">Zoom avant</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">Largeur</label>
                  <select
                    value={selectedBlock.position.width}
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      position: { ...selectedBlock.position, width: parseInt(e.target.value) } 
                    })}
                    className="w-full px-2 py-1 border rounded"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Hauteur</label>
                  <select
                    value={selectedBlock.position.height}
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      position: { ...selectedBlock.position, height: parseInt(e.target.value) } 
                    })}
                    className="w-full px-2 py-1 border rounded"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Styles</label>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-500">Couleur texte</label>
                  <input 
                    type="color" 
                    value={selectedBlock.styles.color || '#000000'} 
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, color: e.target.value } 
                    })}
                    className="w-full border rounded h-8"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Couleur fond</label>
                  <input 
                    type="color" 
                    value={selectedBlock.styles.backgroundColor || '#ffffff'} 
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, backgroundColor: e.target.value } 
                    })}
                    className="w-full border rounded h-8"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">Padding</label>
                  <input 
                    type="text" 
                    value={selectedBlock.styles.padding || '0'} 
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, padding: e.target.value } 
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Border Radius</label>
                  <input 
                    type="text" 
                    value={selectedBlock.styles.borderRadius || '0'} 
                    onChange={(e) => updateBlock(selectedBlock.id, { 
                      styles: { ...selectedBlock.styles, borderRadius: e.target.value } 
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageEditor;