import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Components
import ColorPicker from '../components/ui/ColorPicker';

// Services
import { getSiteTheme, updateSiteTheme, createTheme, exportTheme } from '../services/api';

// Contexts
import { useAlert } from '../contexts/AlertContext';

// Styled components
const ThemeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '80vh'
}));

const ColorSwatch = styled(Box)(({ color, theme }) => ({
  width: '100%',
  height: '100px',
  backgroundColor: color,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

const FontPreview = styled(Box)(({ fontFamily, theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[2]
  }
}));

const PreviewPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(3)
}));

/**
 * Page d'édition du thème du site
 */
const ThemeEditor = () => {
  const [theme, setTheme] = useState({
    id: 'default',
    name: 'Thème par défaut',
    colors: {
      primary: '#0a4b44',
      accent: '#d4a039',
      light: '#f9f5f0',
      dark: '#1f332e',
      neutral: '#e6e0d4'
    },
    fonts: {
      heading: "'Cormorant Garamond', serif",
      body: "'Montserrat', sans-serif"
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColorKey, setCurrentColorKey] = useState('');
  const [customThemeName, setCustomThemeName] = useState('');
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalTheme, setOriginalTheme] = useState(null);
  
  const { showSuccess, showError } = useAlert();
  
  // Charger le thème actif
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true);
        const themeData = await getSiteTheme();
        setTheme(themeData);
        setOriginalTheme(JSON.stringify(themeData));
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
        showError('Erreur lors du chargement du thème');
      } finally {
        setLoading(false);
      }
    };
    
    loadTheme();
  }, [showError]);
  
  // Détecter les changements
  useEffect(() => {
    if (originalTheme) {
      setHasChanges(JSON.stringify(theme) !== originalTheme);
    }
  }, [theme, originalTheme]);
  
  // Gestionnaires d'événements
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleColorClick = (colorKey) => {
    setCurrentColorKey(colorKey);
    setColorPickerOpen(true);
  };
  
  const handleColorChange = (color) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [currentColorKey]: color
      }
    }));
  };
  
  const handleFontChange = (fontType, value) => {
    setTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontType]: value
      }
    }));
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSiteTheme(theme);
      setOriginalTheme(JSON.stringify(theme));
      showSuccess('Thème enregistré avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du thème:', error);
      showError('Erreur lors de l\'enregistrement du thème');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveAsClick = () => {
    setCustomThemeName(theme.name + ' - Copie');
    setSaveAsDialogOpen(true);
  };
  
  const handleSaveAs = async () => {
    if (!customThemeName.trim()) {
      showError('Le nom du thème est requis');
      return;
    }
    
    try {
      setSaving(true);
      
      // Générer un ID à partir du nom
      const themeId = customThemeName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Créer un nouveau thème
      const newTheme = {
        ...theme,
        id: themeId,
        name: customThemeName
      };
      
      await createTheme(themeId, newTheme);
      showSuccess('Nouveau thème créé avec succès!');
      setSaveAsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du thème:', error);
      showError('Erreur lors de la création du thème');
    } finally {
      setSaving(false);
    }
  };
  
  const handleExport = async () => {
    try {
      setSaving(true);
      const result = await exportTheme(theme.id);
      
      // Créer un lien de téléchargement pour le thème
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        // Fallback si pas d'URL de téléchargement
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(theme, null, 2))}`;
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `${theme.id}-theme.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
      
      showSuccess('Thème exporté avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'export du thème:', error);
      showError('Erreur lors de l\'export du thème');
    } finally {
      setSaving(false);
    }
  };
  
  // Contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Couleurs
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Palette de couleurs
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Cliquez sur une couleur pour la modifier. Les modifications seront immédiatement prévisualisées, mais ne seront pas enregistrées tant que vous n'aurez pas cliqué sur "Enregistrer".
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Couleur principale
                </Typography>
                <ColorSwatch 
                  color={theme.colors.primary} 
                  onClick={() => handleColorClick('primary')}
                />
                <TextField
                  fullWidth
                  label="Code couleur"
                  value={theme.colors.primary}
                  onChange={(e) => handleColorChange(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Utilisée pour les éléments principaux, en-tête, boutons, etc.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Couleur d'accent
                </Typography>
                <ColorSwatch 
                  color={theme.colors.accent} 
                  onClick={() => handleColorClick('accent')}
                />
                <TextField
                  fullWidth
                  label="Code couleur"
                  value={theme.colors.accent}
                  onChange={(e) => handleColorChange(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Utilisée pour les éléments secondaires, boutons d'action, surbrillance, etc.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Couleur claire
                </Typography>
                <ColorSwatch 
                  color={theme.colors.light} 
                  onClick={() => handleColorClick('light')}
                />
                <TextField
                  fullWidth
                  label="Code couleur"
                  value={theme.colors.light}
                  onChange={(e) => handleColorChange(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Utilisée pour les arrière-plans clairs, les sections, etc.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Couleur foncée
                </Typography>
                <ColorSwatch 
                  color={theme.colors.dark} 
                  onClick={() => handleColorClick('dark')}
                />
                <TextField
                  fullWidth
                  label="Code couleur"
                  value={theme.colors.dark}
                  onChange={(e) => handleColorChange(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Utilisée pour le texte, les éléments foncés, etc.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Couleur neutre
                </Typography>
                <ColorSwatch 
                  color={theme.colors.neutral} 
                  onClick={() => handleColorClick('neutral')}
                />
                <TextField
                  fullWidth
                  label="Code couleur"
                  value={theme.colors.neutral}
                  onChange={(e) => handleColorChange(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Utilisée pour les éléments neutres, les bordures, etc.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1: // Typographie
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Typographie
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choisissez les polices principales du site.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Police des titres
                </Typography>
                <FontPreview fontFamily={theme.fonts.heading}>
                  <Typography variant="h3" gutterBottom style={{ fontFamily: theme.fonts.heading }}>
                    Titre de démonstration
                  </Typography>
                  <Typography variant="h5" style={{ fontFamily: theme.fonts.heading }}>
                    Sous-titre de démonstration
                  </Typography>
                </FontPreview>
                <TextField
                  fullWidth
                  label="Police des titres"
                  value={theme.fonts.heading}
                  onChange={(e) => handleFontChange('heading', e.target.value)}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Spécifiez une ou plusieurs polices séparées par des virgules, en terminant par une famille générique (serif, sans-serif, etc.)">
                        <InputAdornment position="end">
                          <HelpOutlineIcon />
                        </InputAdornment>
                      </Tooltip>
                    ),
                  }}
                  helperText="Exemple: 'Cormorant Garamond', serif"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Police du corps de texte
                </Typography>
                <FontPreview fontFamily={theme.fonts.body}>
                  <Typography variant="body1" paragraph style={{ fontFamily: theme.fonts.body }}>
                    Ceci est un exemple de texte principal qui apparaîtra sur votre site. La lisibilité est essentielle pour une bonne expérience utilisateur.
                  </Typography>
                  <Typography variant="body2" style={{ fontFamily: theme.fonts.body }}>
                    Voici un exemple de texte secondaire, généralement utilisé pour les descriptions moins importantes ou les notes.
                  </Typography>
                </FontPreview>
                <TextField
                  fullWidth
                  label="Police du corps de texte"
                  value={theme.fonts.body}
                  onChange={(e) => handleFontChange('body', e.target.value)}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Spécifiez une ou plusieurs polices séparées par des virgules, en terminant par une famille générique (serif, sans-serif, etc.)">
                        <InputAdornment position="end">
                          <HelpOutlineIcon />
                        </InputAdornment>
                      </Tooltip>
                    ),
                  }}
                  helperText="Exemple: 'Montserrat', sans-serif"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Conseil: Utilisez des polices disponibles sur Google Fonts pour une meilleure compatibilité et des temps de chargement optimaux.
                </Typography>
              </Alert>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  href="https://fonts.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Parcourir Google Fonts
                </Button>
              </Box>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  // Prévisualisation du thème
  const renderPreview = () => {
    return (
      <PreviewPanel>
        <Typography variant="h6" gutterBottom>
          Prévisualisation du thème
        </Typography>
        
        <Box sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mt: 2 }}>
          <Box sx={{ p: 2, backgroundColor: theme.colors.primary, color: 'white' }}>
            <Typography variant="h5" sx={{ fontFamily: theme.fonts.heading }}>
              En-tête du site
            </Typography>
          </Box>
          
          <Box sx={{ p: 3, backgroundColor: theme.colors.light }}>
            <Typography variant="h2" gutterBottom sx={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}>
              Titre principal
            </Typography>
            
            <Typography variant="h4" gutterBottom sx={{ color: theme.colors.dark, fontFamily: theme.fonts.heading }}>
              Sous-titre de la page
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ color: theme.colors.dark, fontFamily: theme.fonts.body }}>
              Ceci est un exemple de texte dans votre thème personnalisé. La police, les couleurs et les styles sont basés sur vos choix.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button variant="contained" sx={{ backgroundColor: theme.colors.primary, color: 'white' }}>
                Bouton principal
              </Button>
              <Button variant="outlined" sx={{ borderColor: theme.colors.accent, color: theme.colors.accent }}>
                Bouton secondaire
              </Button>
            </Box>
            
            <Box sx={{ p: 2, backgroundColor: theme.colors.neutral, borderRadius: 1, mb: 3 }}>
              <Typography variant="h6" sx={{ color: theme.colors.dark, fontFamily: theme.fonts.heading }}>
                Section mise en avant
              </Typography>
              <Typography variant="body2" sx={{ color: theme.colors.dark, fontFamily: theme.fonts.body }}>
                Exemple de section avec une couleur de fond neutre
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ p: 2, flex: 1, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}>
                  Carte 1
                </Typography>
                <Typography variant="body2" sx={{ color: theme.colors.dark, fontFamily: theme.fonts.body }}>
                  Description de la carte
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, flex: 1, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
                <Typography variant="h6" sx={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}>
                  Carte 2
                </Typography>
                <Typography variant="body2" sx={{ color: theme.colors.dark, fontFamily: theme.fonts.body }}>
                  Description de la carte
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ p: 2, backgroundColor: theme.colors.dark, color: 'white' }}>
            <Typography variant="body2" sx={{ fontFamily: theme.fonts.body }}>
              Pied de page du site
            </Typography>
          </Box>
        </Box>
      </PreviewPanel>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <ThemeContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Éditeur de thème
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
          >
            Importer
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={saving}
          >
            Exporter
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleSaveAsClick}
            disabled={saving}
          >
            Enregistrer sous
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom du thème"
              value={theme.name}
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Identifiant: {theme.id}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<ColorLensIcon />} label="Couleurs" />
              <Tab icon={<TextFormatIcon />} label="Typographie" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {renderTabContent()}
            </Box>
          </Paper>
          
          {renderPreview()}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Aperçu du thème
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Palette de couleurs
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {Object.entries(theme.colors).map(([key, color]) => (
                <Box
                  key={key}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleColorClick(key)}
                />
              ))}
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Typographie
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: theme.fonts.heading, mb: 1 }}>
              Titre (Heading)
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: theme.fonts.body, mb: 3 }}>
              Texte principal (Body)
            </Typography>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VisibilityIcon />}
              sx={{ mt: 2 }}
            >
              Prévisualiser sur le site
            </Button>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Les modifications ne seront visibles sur le site public qu'après avoir cliqué sur "Enregistrer" puis publié le site.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialogue de sélection de couleur */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Choisir une couleur</DialogTitle>
        <DialogContent>
          <ColorPicker
            color={currentColorKey ? theme.colors[currentColorKey] : '#000000'}
            onChange={handleColorChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue "Enregistrer sous" */}
      <Dialog
        open={saveAsDialogOpen}
        onClose={() => setSaveAsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enregistrer le thème sous...</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du thème"
            fullWidth
            value={customThemeName}
            onChange={(e) => setCustomThemeName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveAsDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSaveAs} 
            color="primary" 
            variant="contained"
            disabled={saving || !customThemeName.trim()}
          >
            {saving ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeContainer>
  );
};

export default ThemeEditor;