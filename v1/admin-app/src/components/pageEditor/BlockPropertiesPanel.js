import React, { useState, useEffect } from 'react';
import TextEditor from './TextEditor';
import ColorPicker from './ColorPicker';
import MediaSelector from './MediaSelector';
import AnimationSelector from './AnimationSelector';

const BlockPropertiesPanel = ({ block, onUpdate, onDelete }) => {
  const [blockData, setBlockData] = useState(block || {});

  // Mettre à jour les données du bloc lorsque la prop change
  useEffect(() => {
    if (block) {
      setBlockData(block);
    }
  }, [block]);

  if (!block) {
    return (
      <div className="block-properties-panel empty-panel">
        <p>Sélectionnez un bloc pour afficher ses propriétés</p>
      </div>
    );
  }

  // Mettre à jour une propriété du bloc
  const updateProperty = (key, value) => {
    const updatedBlock = {
      ...blockData,
      [key]: value
    };
    setBlockData(updatedBlock);
    if (onUpdate) {
      onUpdate(updatedBlock);
    }
  };

  // Mettre à jour une propriété de style
  const updateStyle = (key, value) => {
    const updatedStyles = {
      ...(blockData.styles || {}),
      [key]: value
    };
    updateProperty('styles', updatedStyles);
  };

  // Gérer la suppression du bloc
  const handleDelete = () => {
    if (onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
      onDelete(blockData.id);
    }
  };

  return (
    <div className="block-properties-panel">
      <div className="panel-header">
        <h3>Propriétés du bloc</h3>
        <button 
          className="delete-button" 
          onClick={handleDelete}
          title="Supprimer ce bloc"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>

      <div className="panel-content">
        {/* Propriétés générales */}
        <div className="property-section">
          <h4>Informations générales</h4>
          
          <div className="property-field">
            <label>Nom du bloc</label>
            <input 
              type="text" 
              value={blockData.name || ''} 
              onChange={(e) => updateProperty('name', e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="property-field">
            <label>Type</label>
            <div className="property-value">
              {blockData.type === 'text' && <span><i className="fas fa-font"></i> Texte</span>}
              {blockData.type === 'image' && <span><i className="fas fa-image"></i> Image</span>}
              {blockData.type === 'video' && <span><i className="fas fa-video"></i> Vidéo</span>}
            </div>
          </div>
          
          <div className="property-field">
            <label>Visible</label>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={blockData.isVisible !== false} 
                onChange={(e) => updateProperty('isVisible', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Contenu du bloc */}
        <div className="property-section">
          <h4>Contenu</h4>
          
          {/* Éditeur de texte pour les blocs de texte */}
          {blockData.type === 'text' && (
            <div className="property-field full-width">
              <TextEditor 
                initialContent={blockData.content} 
                onChange={(content) => updateProperty('content', content)}
              />
            </div>
          )}
          
          {/* Sélecteur de média pour les blocs d'image */}
          {blockData.type === 'image' && (
            <div className="property-field full-width">
              <MediaSelector 
                selectedMedia={blockData.content} 
                onSelect={(media) => updateProperty('content', {
                  src: media.url,
                  alt: blockData.content?.alt || media.name
                })}
              />
              
              <div className="property-field">
                <label>Texte alternatif</label>
                <input 
                  type="text" 
                  value={blockData.content?.alt || ''} 
                  onChange={(e) => updateProperty('content', {
                    ...blockData.content,
                    alt: e.target.value
                  })}
                  className="form-control"
                  placeholder="Description de l'image"
                />
              </div>
            </div>
          )}
          
          {/* Sélecteur de média pour les blocs vidéo */}
          {blockData.type === 'video' && (
            <div className="property-field full-width">
              <MediaSelector 
                selectedMedia={blockData.content} 
                onSelect={(media) => updateProperty('content', {
                  src: media.url
                })}
                mediaType="video"
              />
              
              <div className="property-field">
                <label>Lecture automatique</label>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={blockData.content?.autoplay || false} 
                    onChange={(e) => updateProperty('content', {
                      ...blockData.content,
                      autoplay: e.target.checked
                    })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              
              <div className="property-field">
                <label>Lecture en boucle</label>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={blockData.content?.loop || false} 
                    onChange={(e) => updateProperty('content', {
                      ...blockData.content,
                      loop: e.target.checked
                    })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Styles du bloc */}
        <div className="property-section">
          <h4>Apparence</h4>
          
          <div className="property-field">
            <ColorPicker 
              color={blockData.styles?.color || '#000000'} 
              onChange={(color) => updateStyle('color', color)}
              label="Couleur du texte"
            />
          </div>
          
          <div className="property-field">
            <ColorPicker 
              color={blockData.styles?.backgroundColor || 'transparent'} 
              onChange={(color) => updateStyle('backgroundColor', color)}
              label="Couleur d'arrière-plan"
            />
          </div>
          
          <div className="property-field">
            <label>Padding (marge intérieure)</label>
            <input 
              type="text" 
              value={blockData.styles?.padding || '0'} 
              onChange={(e) => updateStyle('padding', e.target.value)}
              className="form-control"
              placeholder="ex: 10px ou 10px 20px"
            />
          </div>
          
          <div className="property-field">
            <label>Marge extérieure</label>
            <input 
              type="text" 
              value={blockData.styles?.margin || '0'} 
              onChange={(e) => updateStyle('margin', e.target.value)}
              className="form-control"
              placeholder="ex: 10px ou 10px 20px"
            />
          </div>
          
          <div className="property-field">
            <label>Bordure</label>
            <input 
              type="text" 
              value={blockData.styles?.border || 'none'} 
              onChange={(e) => updateStyle('border', e.target.value)}
              className="form-control"
              placeholder="ex: 1px solid #000"
            />
          </div>
          
          <div className="property-field">
            <label>Rayon de bordure</label>
            <input 
              type="text" 
              value={blockData.styles?.borderRadius || '0'} 
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
              className="form-control"
              placeholder="ex: 5px ou 50%"
            />
          </div>
        </div>

        {/* Animation */}
        <div className="property-section">
          <h4>Animation</h4>
          <AnimationSelector 
            animation={blockData.animation || 'none'} 
            onChange={(animation) => updateProperty('animation', animation)}
          />
        </div>
      </div>
    </div>
  );
};

export default BlockPropertiesPanel;