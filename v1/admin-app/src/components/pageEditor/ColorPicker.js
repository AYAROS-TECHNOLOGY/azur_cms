import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = ({ color, onChange, label }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color || '#FFFFFF');
  const pickerRef = useRef(null);

  // Mettre à jour la couleur actuelle lorsque la prop change
  useEffect(() => {
    if (color && color !== currentColor) {
      setCurrentColor(color);
    }
  }, [color]);

  // Fermer le color picker lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) && displayColorPicker) {
        setDisplayColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [displayColorPicker]);

  // Ouvrir/fermer le color picker
  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  // Gérer le changement de couleur
  const handleChange = (newColor) => {
    setCurrentColor(newColor.hex);
    if (onChange) {
      onChange(newColor.hex);
    }
  };

  return (
    <div className="color-picker-container">
      {label && <label className="color-picker-label">{label}</label>}
      <div className="color-picker-preview" onClick={handleClick}>
        <div 
          className="color-swatch"
          style={{ 
            backgroundColor: currentColor,
            border: '1px solid #ddd'
          }}
        />
        <span className="color-value">{currentColor}</span>
      </div>
      {displayColorPicker && (
        <div className="color-picker-popover" ref={pickerRef}>
          <SketchPicker 
            color={currentColor}
            onChange={handleChange}
            disableAlpha={true}
            presetColors={[
              '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', 
              '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', 
              '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF'
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;ss