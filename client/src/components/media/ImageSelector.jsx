// client/src/components/media/ImageSelector.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Services
import { getMediaList, uploadMedia } from '../../services/api';

// Contexts
import { useAlert } from '../../contexts/AlertContext';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 140,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundColor: theme.palette.action.hover
}));

const PreviewDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  '& img': {
    maxWidth: '100%',
    maxHeight: '70vh',
    display: 'block',
    margin: '0 auto',
  }
}));

/**
 * Composant de sélection d'image
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - État d'ouverture du dialogue
 * @param {Function} props.onClose - Fonction de fermeture du dialogue
 * @param {Function} props.onSelect - Fonction de sélection d'une image
 */
const ImageSelector = ({ open, onClose, onSelect }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const { showSuccess, showError } = useAlert();
  
  // Charger les médias au montage du composant
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const files = await getMediaList();
        // Ne garder que les images
        const imageFiles = files.filter(file => file.contentType.startsWith('image/'));
        setMediaFiles(imageFiles);
        setFilteredFiles(imageFiles);
      } catch (error) {
        console.error('Erreur lors du chargement des médias:', error);
        showError('Erreur lors du chargement des médias');
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchMedia();
    }
  }, [open, showError]);
  
  // Filtrer les médias en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm) {
      const filtered = mediaFiles.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(mediaFiles);
    }
  }, [searchTerm, mediaFiles]);
  
  // Gestionnaire de changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Gestionnaire d'upload de fichier
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Vérifier si c'est une image
    if (!file.type.startsWith('image/')) {
      showError('Veuillez sélectionner une image');
      return;
    }
    
    try {
      setUploading(true);
      const result = await uploadMedia(file, 'images');
      showSuccess('Image téléchargée avec succès!');
      
      // Ajouter le nouveau fichier à la liste
      setMediaFiles(prev => [...prev, {
        name: result.filename,
        url: result.url,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'you'
      }]);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      showError('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };
  
  // Gestionnaire de sélection d'image
  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage.url);
      onClose();
    }
  };
  
  // Gestionnaire de prévisualisation d'image
  const handlePreview = (image) => {
    setPreviewUrl(image.url);
    setPreviewOpen(true);
  };
  
  // Rendu du contenu de l'onglet
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Bibliothèque de médias
        return (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                placeholder="Rechercher une image..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '300px' }}
              />
              
              <Button
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                disabled={uploading}
              >
                Télécharger
                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredFiles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Aucune image trouvée
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Télécharger une image
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredFiles.map((file) => (
                  <Grid item xs={6} sm={4} md={3} key={file.name}>
                    <Card 
                      raised={selectedImage?.name === file.name}
                      sx={{ 
                        border: selectedImage?.name === file.name ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                    >
                      <CardActionArea onClick={() => setSelectedImage(file)}>
                        <StyledCardMedia
                          image={file.url}
                          title={file.name.split('/').pop()}
                        />
                      </CardActionArea>
                      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" noWrap sx={{ maxWidth: '70%' }} title={file.name.split('/').pop()}>
                          {file.name.split('/').pop()}
                        </Typography>
                        <Tooltip title="Prévisualiser">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(file);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        );
      case 1: // URL externe
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Entrez l'URL d'une image externe (cette option est désactivée pour des raisons de sécurité).
            </Typography>
            <TextField
              fullWidth
              label="URL de l'image"
              placeholder="https://exemple.com/image.jpg"
              disabled
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Note: L'utilisation d'images externes peut poser des problèmes de sécurité et de performance.
              Il est recommandé de télécharger les images sur votre propre serveur.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Sélectionner une image
        </DialogTitle>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="image source tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab label="Bibliothèque de médias" />
          <Tab label="URL externe" disabled />
        </Tabs>
        
        <DialogContent dividers>
          {renderTabContent()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSelect}
            variant="contained"
            color="primary"
            disabled={!selectedImage}
          >
            Sélectionner
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de prévisualisation */}
      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Prévisualisation
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              if (previewUrl) {
                const image = mediaFiles.find(file => file.url === previewUrl);
                if (image) {
                  setSelectedImage(image);
                  setPreviewOpen(false);
                }
              }
            }}
          >
            Sélectionner cette image
          </Button>
        </DialogTitle>
        <DialogContent>
          <img src={previewUrl} alt="Preview" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </PreviewDialog>
    </>
  );
};

export default ImageSelector;