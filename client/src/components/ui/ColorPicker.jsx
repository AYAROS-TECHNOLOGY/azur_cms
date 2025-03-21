// client/src/components/ui/ColorPicker.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Grid, Typography, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SketchPicker } from 'react-color';

// Styled components
const ColorPickerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const ColorPreview = styled(Box)(({ color, theme }) => ({
  width: '100%',
  height: '50px',
  backgroundColor: color,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`
}));

const ColorPalette = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

const ColorSwatch = styled(Box)(({ color, selected, theme }) => ({
  width: '30px',
  height: '30px',
  backgroundColor: color,
  borderRadius: theme.shape.borderRadius,
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)'
  }
}));

/**
 * Composant sélecteur de couleur
 * @param {Object} props - Propriétés du composant
 * @param {string} props.color - Couleur actuelle
 * @param {Function} props.onChange - Fonction appelée lors du changement de couleur
 */
const ColorPicker = ({ color, onChange }) => {
  const [currentColor, setCurrentColor] = useState(color || '#000000');
  const [tabValue, setTabValue] = useState(0);
  
  // Synchroniser avec la prop couleur
  useEffect(() => {
    setCurrentColor(color || '#000000');
  }, [color]);
  
  // Gestionnaires d'événements
  const handleColorChange = (newColor) => {
    setCurrentColor(newColor.hex);
    if (onChange) {
      onChange(newColor.hex);
    }
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentColor(value);
    if (onChange) {
      onChange(value);
    }
  };
  
  const handleSwatchClick = (swatchColor) => {
    setCurrentColor(swatchColor);
    if (onChange) {
      onChange(swatchColor);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Palettes de couleurs prédéfinies
  const colorPalettes = {
    nature: [
      '#0a4b44', // Vert foncé
      '#1c7c74', // Vert Ayurvédique
      '#6BAB90', // Vert sauge
      '#87B08D', // Vert mousse
      '#d4a039', // Or
      '#C29545', // Ambre
      '#FFC876', // Jaune clair
      '#E8D7A9', // Beige
      '#7a6c5d', // Brun moyen
      '#614e42', // Brun foncé
    ],
    neutrals: [
      '#f9f5f0', // Crème
      '#e6e0d4', // Beige clair
      '#d3c9b8', // Beige moyen
      '#b6a68e', // Beige foncé
      '#8e8778', // Gris taupe
      '#6c6155', // Brun gris
      '#463f35', // Brun foncé
      '#1f332e', // Vert forêt très foncé
      '#2c2c2c', // Gris très foncé
      '#000000', // Noir
    ],
    vibrant: [
      '#FF6B6B', // Rouge corail
      '#FFB84D', // Orange
      '#FFE66D', // Jaune
      '#4ECDC4', // Turquoise
      '#8067B7', // Violet
      '#F7FFF7', // Blanc cassé
      '#1A535C', // Vert sarcelle foncé
      '#FF9F1C', // Orange foncé
      '#F15BB5', // Rose
      '#41EAD4', // Turquoise clair
    ]
  };
  
  // Rendu du sélecteur en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Roue de couleur
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <SketchPicker
              color={currentColor}
              onChange={handleColorChange}
              disableAlpha={true}
              presetColors={[]}
              width="100%"
            />
          </Box>
        );
      
      case 1: // Palettes
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Palette Nature
            </Typography>
            <ColorPalette>
              {colorPalettes.nature.map((swatchColor, index) => (
                <ColorSwatch
                  key={`nature-${index}`}
                  color={swatchColor}
                  selected={swatchColor.toLowerCase() === currentColor.toLowerCase()}
                  onClick={() => handleSwatchClick(swatchColor)}
                />
              ))}
            </ColorPalette>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Palette Neutres
            </Typography>
            <ColorPalette>
              {colorPalettes.neutrals.map((swatchColor, index) => (
                <ColorSwatch
                  key={`neutral-${index}`}
                  color={swatchColor}
                  selected={swatchColor.toLowerCase() === currentColor.toLowerCase()}
                  onClick={() => handleSwatchClick(swatchColor)}
                />
              ))}
            </ColorPalette>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Palette Vibrante
            </Typography>
            <ColorPalette>
              {colorPalettes.vibrant.map((swatchColor, index) => (
                <ColorSwatch
                  key={`vibrant-${index}`}
                  color={swatchColor}
                  selected={swatchColor.toLowerCase() === currentColor.toLowerCase()}
                  onClick={() => handleSwatchClick(swatchColor)}
                />
              ))}
            </ColorPalette>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <ColorPickerContainer>
      <ColorPreview color={currentColor} />
      
      <TextField
        fullWidth
        label="Code couleur (HEX)"
        value={currentColor}
        onChange={handleInputChange}
        variant="outlined"
        placeholder="#000000"
      />
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="color picker tabs"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Sélecteur" />
        <Tab label="Palettes" />
      </Tabs>
      
      <Box sx={{ p: 1 }}>
        {renderTabContent()}
      </Box>
    </ColorPickerContainer>
  );
};

export default ColorPicker;