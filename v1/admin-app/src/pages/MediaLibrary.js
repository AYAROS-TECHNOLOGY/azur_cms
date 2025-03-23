import React, { useState } from 'react';

const MediaLibrary = () => {
  // État pour les médias
  const [mediaItems, setMediaItems] = useState([
    { 
      id: 1, 
      name: 'banner-1.jpg', 
      type: 'image', 
      url: '/api/placeholder/800/400', 
      size: 245000, 
      dimensions: { width: 800, height: 400 }, 
      createdAt: '22 Mars 2025' 
    },
    { 
      id: 2, 
      name: 'product-1.jpg', 
      type: 'image', 
      url: '/api/placeholder/400/400', 
      size: 120000, 
      dimensions: { width: 400, height: 400 }, 
      createdAt: '21 Mars 2025' 
    },
    { 
      id: 3, 
      name: 'presentation.mp4', 
      type: 'video', 
      url: '/api/placeholder/640/360', 
      size: 2450000, 
      dimensions: { width: 640, height: 360 }, 
      createdAt: '20 Mars 2025' 
    },
    { 
      id: 4, 
      name: 'background.jpg', 
      type: 'image', 
      url: '/api/placeholder/1920/1080', 
      size: 345000, 
      dimensions: { width: 1920, height: 1080 }, 
      createdAt: '19 Mars 2025' 
    }
  ]);
  
  // État pour le filtre et la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // État pour l'élément sélectionné
  const [selectedItem, setSelectedItem] = useState(null);
  
  // État pour le formulaire de redimensionnement
  const [resizeConfig, setResizeConfig] = useState({
    width: '',
    height: '',
    maintainAspectRatio: true
  });
  
  // Filtrer les médias
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });
  
  // Fonction pour supprimer un élément
  const deleteItem = (id) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };
  
  // Fonction pour redimensionner une image
  const resizeImage = () => {
    if (!selectedItem || selectedItem.type !== 'image') return;
    
    // Simuler le redimensionnement
    const updatedMedia = mediaItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          dimensions: {
            width: parseInt(resizeConfig.width) || item.dimensions.width,
            height: parseInt(resizeConfig.height) || item.dimensions.height
          },
          // Supposons que la taille du fichier change proportionnellement
          size: item.size * (
            (parseInt(resizeConfig.width) || item.dimensions.width) / item.dimensions.width *
            (parseInt(resizeConfig.height) || item.dimensions.height) / item.dimensions.height
          )
        };
      }
      return item;
    });
    
    setMediaItems(updatedMedia);
    // Mettre à jour l'élément sélectionné
    setSelectedItem(updatedMedia.find(item => item.id === selectedItem.id));
  };
  
  // Simuler le téléchargement d'un nouveau média
  const handleUpload = () => {
    const newId = Math.max(...mediaItems.map(item => item.id)) + 1;
    const newItem = {
      id: newId,
      name: `new-upload-${newId}.jpg`,
      type: 'image',
      url: '/api/placeholder/600/400',
      size: 180000,
      dimensions: { width: 600, height: 400 },
      createdAt: '22 Mars 2025'
    };
    
    setMediaItems([newItem, ...mediaItems]);
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bibliothèque de médias</h1>
        <button 
          onClick={handleUpload}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Ajouter un média
        </button>
      </div>
      
      {/* Recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher un média..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous les types</option>
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Liste des médias */}
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Médias ({filteredMedia.length})</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredMedia.map(item => (
                <div 
                  key={item.id}
                  className={`border rounded overflow-hidden cursor-pointer ${
                    selectedItem && selectedItem.id === item.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                        <span>Vidéo</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.dimensions.width} × {item.dimensions.height}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Détails du média sélectionné */}
        {selectedItem && (
          <div className="w-full md:w-96 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Détails du média</h2>
            
            <div className="mb-4">
              {selectedItem.type === 'image' ? (
                <img src={selectedItem.url} alt={selectedItem.name} className="w-full h-auto rounded" />
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-800 flex items-center justify-center text-white rounded">
                  <span>Prévisualisation vidéo</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nom</label>
                <input 
                  type="text" 
                  value={selectedItem.name} 
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Type</label>
                  <div className="px-3 py-2 border rounded bg-gray-50">
                    {selectedItem.type === 'image' ? 'Image' : 'Vidéo'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Taille</label>
                  <div className="px-3 py-2 border rounded bg-gray-50">
                    {(selectedItem.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Largeur</label>
                  <div className="px-3 py-2 border rounded bg-gray-50">
                    {selectedItem.dimensions.width} px
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Hauteur</label>
                  <div className="px-3 py-2 border rounded bg-gray-50">
                    {selectedItem.dimensions.height} px
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date d'ajout</label>
                <div className="px-3 py-2 border rounded bg-gray-50">
                  {selectedItem.createdAt}
                </div>
              </div>
            </div>
            
            {selectedItem.type === 'image' && (
              <div className="border-t pt-4 mb-6">
                <h3 className="text-md font-bold text-gray-800 mb-3">Redimensionner</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Largeur</label>
                    <input 
                      type="number" 
                      value={resizeConfig.width} 
                      onChange={(e) => {
                        const newWidth = e.target.value;
                        setResizeConfig({
                          ...resizeConfig,
                          width: newWidth,
                          height: resizeConfig.maintainAspectRatio 
                            ? Math.round(newWidth * selectedItem.dimensions.height / selectedItem.dimensions.width) 
                            : resizeConfig.height
                        });
                      }}
                      placeholder={selectedItem.dimensions.width}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Hauteur</label>
                    <input 
                      type="number" 
                      value={resizeConfig.height} 
                      onChange={(e) => {
                        const newHeight = e.target.value;
                        setResizeConfig({
                          ...resizeConfig,
                          height: newHeight,
                          width: resizeConfig.maintainAspectRatio 
                            ? Math.round(newHeight * selectedItem.dimensions.width / selectedItem.dimensions.height) 
                            : resizeConfig.width
                        });
                      }}
                      placeholder={selectedItem.dimensions.height}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    id="maintainAspectRatio"
                    checked={resizeConfig.maintainAspectRatio} 
                    onChange={(e) => setResizeConfig({
                      ...resizeConfig,
                      maintainAspectRatio: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="maintainAspectRatio" className="text-sm text-gray-500">
                    Conserver les proportions
                  </label>
                </div>
                
                <button 
                  onClick={resizeImage}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                >
                  Appliquer
                </button>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex-1">
                Copier l'URL
              </button>
              <button 
                onClick={() => deleteItem(selectedItem.id)}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex-1"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;