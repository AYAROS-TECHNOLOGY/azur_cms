import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const PreviewBox = styled(Paper)(({ theme, animation }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 150,
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  animation: animation
}));

/**
 * Composant de sélection et prévisualisation d'animations
 * @param {Object} props - Propriétés du composant
 * @param {string} props.value - Valeur actuelle de l'animation
 * @param {Function} props.onChange - Fonction de mise à jour
 */
const AnimationSelector = ({ value, onChange }) => {
  const [animation, setAnimation] = useState(value || '');
  const [duration, setDuration] = useState(1000);
  const [delay, setDelay] = useState(0);
  const [timing, setTiming] = useState('ease');
  const [infinite, setInfinite] = useState(false);
  const [customAnimation, setCustomAnimation] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Appliquer l'animation sélectionnée
  const applyAnimation = () => {
    let animationString = '';
    
    if (animation === 'custom') {
      animationString = customAnimation;
    } else if (animation) {
      animationString = `${animation} ${duration}ms ${timing} ${delay}ms ${infinite ? 'infinite' : ''}`;
    }
    
    if (onChange) {
      onChange(animationString.trim());
    }
  };
  
  // Démarrer la prévisualisation
  const startPreview = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, duration + delay + 100);
  };
  
  // Obtenir la chaîne CSS de l'animation pour la prévisualisation
  const getPreviewAnimation = () => {
    if (!animation || animation === 'none' || !isPlaying) return '';
    
    if (animation === 'custom') {
      return customAnimation;
    }
    
    return `${animation} ${duration}ms ${timing} ${delay}ms ${infinite ? 'infinite' : ''}`;
  };
  
  return (
    <Box>
      <PreviewBox animation={getPreviewAnimation()}>
        <Typography variant="h5">
          Aperçu de l'animation
        </Typography>
      </PreviewBox>
      
      <Button 
        variant="outlined" 
        onClick={startPreview} 
        fullWidth
        sx={{ mb: 3 }}
      >
        Prévisualiser l'animation
      </Button>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Type d'animation</InputLabel>
            <Select
              value={animation}
              onChange={(e) => setAnimation(e.target.value)}
              label="Type d'animation"
            >
              <MenuItem value="none">Aucune animation</MenuItem>
              <MenuItem value="fadeIn">Fondu entrant</MenuItem>
              <MenuItem value="fadeOut">Fondu sortant</MenuItem>
              <MenuItem value="slideInLeft">Entrée depuis la gauche</MenuItem>
              <MenuItem value="slideInRight">Entrée depuis la droite</MenuItem>
              <MenuItem value="slideInUp">Entrée depuis le bas</MenuItem>
              <MenuItem value="slideInDown">Entrée depuis le haut</MenuItem>
              <MenuItem value="zoomIn">Zoom entrant</MenuItem>
              <MenuItem value="zoomOut">Zoom sortant</MenuItem>
              <MenuItem value="bounce">Rebond</MenuItem>
              <MenuItem value="pulse">Pulsation</MenuItem>
              <MenuItem value="shake">Secousse</MenuItem>
              <MenuItem value="rotate">Rotation</MenuItem>
              <MenuItem value="custom">Animation personnalisée</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Fonction de temps</InputLabel>
            <Select
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              label="Fonction de temps"
            >
              <MenuItem value="ease">Ease (par défaut)</MenuItem>
              <MenuItem value="linear">Linear</MenuItem>
              <MenuItem value="ease-in">Ease In</MenuItem>
              <MenuItem value="ease-out">Ease Out</MenuItem>
              <MenuItem value="ease-in-out">Ease In Out</MenuItem>
              <MenuItem value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Rebond (elastic)</MenuItem>
              <MenuItem value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Ressort (spring)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Durée: {duration}ms</Typography>
          <Slider
            value={duration}
            onChange={(e, newValue) => setDuration(newValue)}
            min={100}
            max={5000}
            step={100}
            valueLabelDisplay="auto"
            marks={[
              { value: 100, label: '0.1s' },
              { value: 1000, label: '1s' },
              { value: 3000, label: '3s' },
              { value: 5000, label: '5s' }
            ]}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Délai: {delay}ms</Typography>
          <Slider
            value={delay}
            onChange={(e, newValue) => setDelay(newValue)}
            min={0}
            max={2000}
            step={100}
            valueLabelDisplay="auto"
            marks={[
              { value: 0, label: '0s' },
              { value: 500, label: '0.5s' },
              { value: 1000, label: '1s' },
              { value: 2000, label: '2s' }
            ]}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={infinite}
                onChange={(e) => setInfinite(e.target.checked)}
              />
            }
            label="Animation en boucle (infinite)"
          />
        </Grid>
        
        {animation === 'custom' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Animation CSS personnalisée"
              value={customAnimation}
              onChange={(e) => setCustomAnimation(e.target.value)}
              variant="outlined"
              placeholder="animation-name duration timing-function delay iteration-count direction fill-mode"
              helperText="Format CSS complet : ex. 'bounce 1s ease 0s infinite'"
              margin="normal"
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={applyAnimation}
            fullWidth
          >
            Appliquer cette animation
          </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Animations CSS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Les animations sont définies en CSS et peuvent être personnalisées. Les animations sont visibles lors de la prévisualisation de la page ou sur le site publié.
        </Typography>
      </Box>
    </Box>
  );
};

export default AnimationSelector;