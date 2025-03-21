import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import CropIcon from '@mui/icons-material/Crop';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import ContrastIcon from '@mui/icons-material/Contrast';
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from '@mui/icons-material/Save';

// Styled components
const ImageContainer = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '20px 0',
  overflow: 'hidden'
}));

/**
 * Éditeur d'image simple
 * Cette version est un prototype et ne fait pas réellement d'édition d'image
 * Une implémentation complète nécessiterait une bibliothèque comme fabric.js ou konva
 */
const ImageEditor = ({ open, onClose, imageUrl, onSave }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Réinitialiser les paramètres
  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
  };

  // Simuler l'enregistrement de l'image
  const handleSave = () => {
    // Dans une implémentation réelle, ici nous appliquerions les modifications 
    // et enverrions l'image modifiée au serveur
    onSave && onSave(imageUrl);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Modifier l'image</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Note: Ceci est une version simplifiée de l'éditeur d'image. Les modifications ne sont pas réellement appliquées dans cette démo.
        </Typography>

        <ImageContainer>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Édition"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`
              }}
            />
          )}
        </ImageContainer>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>Luminosité</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BrightnessHighIcon sx={{ mr: 2 }} />
              <Slider
                value={brightness}
                onChange={(e, newValue) => setBrightness(newValue)}
                min={50}
                max={150}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>Contraste</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ContrastIcon sx={{ mr: 2 }} />
              <Slider
                value={contrast}
                onChange={(e, newValue) => setContrast(newValue)}
                min={50}
                max={150}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
          <IconButton onClick={() => setRotation(rotation - 90)}>
            <RotateLeftIcon />
          </IconButton>
          <IconButton onClick={() => setRotation(rotation + 90)}>
            <RotateRightIcon />
          </IconButton>
          <IconButton disabled>
            <CropIcon />
          </IconButton>
          <IconButton onClick={handleReset}>
            <UndoIcon />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Appliquer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageEditor;