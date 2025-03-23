import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MediaSelector = ({ selectedMedia, onSelect, apiUrl }) => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Charger les médias depuis l'API
  const loadMedia = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(apiUrl || '/api/media');
      setMedia(response.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des médias');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les médias
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = mediaType === 'all' || item.type === mediaType;
    return matchesSearch && matchesType;
  });

  // Charger les médias lorsqu'on ouvre le sélecteur
  useEffect(() => {
    if (showModal) {
      loadMedia();
    }
  }, [showModal]);

  // Ouvrir/fermer le sélecteur de médias
  const toggleModal = () => {
    setShowModal(!showModal);
    if (!showModal) {
      setSearchQuery('');
      setMediaType('all');
    }
  };

  // Sélectionner un média
  const handleSelect = (media) => {
    if (onSelect) {
      onSelect(media);
    }
    toggleModal();
  };

  return (
    <div className="media-selector">
      <div className="selected-media-preview">
        {selectedMedia ? (
          <div className="media-preview">
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.name} 
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <i className="fas fa-file-video"></i>
                <span>{selectedMedia.name}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-media-selected">
            <i className="fas fa-image"></i>
            <span>Aucun média sélectionné</span>
          </div>
        )}
      </div>

      <button 
        className="btn btn-primary media-selector-button" 
        onClick={toggleModal}
      >
        Sélectionner un média
      </button>

      {showModal && (
        <div className="media-selector-modal">
          <div className="media-modal-content">
            <div className="modal-header">
              <h3>Sélectionner un média</h3>
              <button className="modal-close" onClick={toggleModal}>×</button>
            </div>

            <div className="modal-filters">
              <input 
                type="text"
                placeholder="Rechercher un média..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />

              <select 
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="type-filter"
              >
                <option value="all">Tous les types</option>
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
              </select>

              <button 
                className="refresh-button"
                onClick={loadMedia}
                disabled={isLoading}
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>

            <div className="media-grid">
              {isLoading ? (
                <div className="loading">Chargement des médias...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : filteredMedia.length === 0 ? (
                <div className="no-results">Aucun média trouvé</div>
              ) : (
                filteredMedia.map(item => (
                  <div 
                    key={item._id}
                    className={`media-item ${selectedMedia && selectedMedia._id === item._id ? 'selected' : ''}`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="media-thumbnail">
                      {item.type === 'image' ? (
                        <img src={item.thumbnailUrl || item.url} alt={item.name} />
                      ) : (
                        <div className="video-thumbnail">
                          <i className="fas fa-file-video"></i>
                        </div>
                      )}
                    </div>
                    <div className="media-info">
                      <div className="media-name">{item.name}</div>
                      <div className="media-meta">{item.dimensions ? `${item.dimensions.width}×${item.dimensions.height}` : ''}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={toggleModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSelector;