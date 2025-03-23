import React from 'react';

const AnimationSelector = ({ animation, onChange }) => {
  // Liste des animations disponibles
  const animations = [
    { value: 'none', label: 'Aucune animation' },
    { value: 'fade-in', label: 'Fondu en entrée' },
    { value: 'slide-in-left', label: 'Glissement depuis la gauche' },
    { value: 'slide-in-right', label: 'Glissement depuis la droite' },
    { value: 'slide-in-top', label: 'Glissement depuis le haut' },
    { value: 'slide-in-bottom', label: 'Glissement depuis le bas' },
    { value: 'zoom-in', label: 'Zoom avant' },
    { value: 'zoom-out', label: 'Zoom arrière' },
    { value: 'bounce', label: 'Rebond' },
    { value: 'pulse', label: 'Pulsation' },
    { value: 'flip', label: 'Retournement' },
    { value: 'shake', label: 'Secousse' }
  ];

  // Gérer le changement d'animation
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Prévisualiser l'animation
  const previewAnimation = () => {
    const element = document.getElementById('animation-preview');
    if (element) {
      // Réinitialiser l'animation
      element.style.animation = 'none';
      // Forcer un repaint
      element.offsetHeight;
      // Appliquer la nouvelle animation
      element.style.animation = '';
      element.className = `animation-preview ${animation}`;
    }
  };

  return (
    <div className="animation-selector">
      <div className="animation-select-container">
        <select 
          value={animation || 'none'} 
          onChange={handleChange}
          className="animation-select"
        >
          {animations.map(anim => (
            <option key={anim.value} value={anim.value}>
              {anim.label}
            </option>
          ))}
        </select>
        
        <button 
          onClick={previewAnimation} 
          className="preview-button"
          disabled={!animation || animation === 'none'}
        >
          <i className="fas fa-play"></i> Prévisualiser
        </button>
      </div>
      
      <div className="animation-preview-container">
        <div id="animation-preview" className={`animation-preview ${animation}`}>
          <div className="preview-content">
            <i className="fas fa-cube"></i>
            <span>Aperçu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationSelector;