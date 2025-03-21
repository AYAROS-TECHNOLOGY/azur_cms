// client/src/components/media/MediaManager.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Toolbar,
  InputAdornment,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CropIcon from '@mui/icons-material/Crop';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Components
import ImageEditor from './ImageEditor';

// Services
import { getMediaList, uploadMedia, deleteMedia } from '../../services/api';

// Contexts
import { useAlert } from '../../contexts/AlertContext';

// Styled components
const UploadArea = styled(Box)(({ theme, isDragging }) => ({
  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragging ? theme.palette.action.hover : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  marginBottom: theme.spacing(3)
}));

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

const MediaPreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.action.hover
}));

const MediaCard = styled(Card)(({ theme, selected }) => ({
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const PreviewPlaceholder = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  '& .MuiSvgIcon-root': {
    fontSize: 48,
    marginBottom: theme.spacing(1)
  }
}));

/**
 * Gestionnaire de médias pour gérer les images et fichiers
 */
const MediaManager = ({ standalone = true, onSelect = null }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [folder, setFolder] = useState('images');
  const [filteredMediaFiles, setFilteredMediaFiles] = useState([]);
  const [filterType, setFilterType] = useState('all');
  
  const { showSuccess, showError } = useAlert();
  
  // Charger les médias au montage du composant
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const files = await getMediaList();
      setMediaFiles(files);
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
      showError('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  }, [showError]);
  
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);
  
  // Filtrer les médias en fonction du terme de recherche et du type
  useEffect(() => {
    let filtered = mediaFiles;
    
    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(file => {
        if (filterType === 'images') {
          return file.contentType.startsWith('image/');
        } else if (filterType === 'documents') {
          return !file.contentType.startsWith('image/');
        }
        return true;
      });
    }
    
    setFilteredMediaFiles(filtered);
  }, [mediaFiles, searchTerm, filterType]);
  
  // Gestionnaires de drag & drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFiles(Array.from(e.dataTransfer.files));
      setUploadDialogOpen(true);
    }
  };
  
  // Gestionnaires de fichiers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
      setUploadDialogOpen(true);
    }
  };
  
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      for (const file of uploadFiles) {
        await uploadMedia(file, folder);
      }
      
      showSuccess(`${uploadFiles.length} fichier(s) uploadé(s) avec succès !`);
      setUploadDialogOpen(false);
      setUploadFiles([]);
      loadMedia();
    } catch (error) {
      console.error('Erreur lors de l\'upload des fichiers:', error);
      showError('Erreur lors de l\'upload des fichiers');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;
    
    try {
      await deleteMedia(selectedMedia.name);
      showSuccess('Fichier supprimé avec succès !');
      setDeleteDialogOpen(false);
      setSelectedMedia(null);
      loadMedia();
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      showError('Erreur lors de la suppression du fichier');
    }
  };
  
  // Gestionnaires de sélection
  const handleSelectMedia = (file) => {
    if (onSelect) {
      onSelect(file.url);
    } else {
      setSelectedMedia(file === selectedMedia ? null : file);
    }
  };
  
  const handlePreviewMedia = () => {
    if (selectedMedia) {
      setPreviewDialogOpen(true);
    }
  };
  
  const handleEditMedia = () => {
    if (selectedMedia && selectedMedia.contentType.startsWith('image/')) {
      setEditDialogOpen(true);
    }
  };
  
  // Rendu des icônes par type de fichier
  const renderFileIcon = (contentType) => {
    if (contentType.startsWith('image/')) {
      return <ImageIcon fontSize="large" />;
    } else if (contentType.includes('pdf')) {
      return <InsertDriveFileIcon fontSize="large" />;
    } else {
      return <InsertDriveFileIcon fontSize="large" />;
    }
  };
  
  // Rendu du gestionnaire de médias
  return (
    <Box>
      {standalone && (
        <Typography variant="h5" component="h1" gutterBottom>
          Gestionnaire de médias
        </Typography>
      )}
      
      <Toolbar sx={{ mb: 2, p: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Rechercher..."
            variant="outlined"
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
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="filter-type-label">Type</InputLabel>
            <Select
              labelId="filter-type-label"
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="images">Images</MenuItem>
              <MenuItem value="documents">Documents</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Télécharger
          </Button>
        </Box>
      </Toolbar>
      
      <UploadArea
        isDragging={isDragging}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <VisuallyHiddenInput
          id="fileInput"
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <CloudUploadIcon fontSize="large" color="primary" />
        <Typography variant="h6" gutterBottom>
          Déposez vos fichiers ici
        </Typography>
        <Typography variant="body2" color="textSecondary">
          ou cliquez pour sélectionner des fichiers
        </Typography>
      </UploadArea>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredMediaFiles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Aucun média trouvé
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredMediaFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.name}>
              <MediaCard
                selected={selectedMedia?.name === file.name}
                onClick={() => handleSelectMedia(file)}
              >
                <MediaPreview>
                  {file.contentType.startsWith('image/') ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={file.url}
                      alt={file.name}
                    />
                  ) : (
                    <PreviewPlaceholder>
                      {renderFileIcon(file.contentType)}
                      <Typography variant="caption">
                        {file.contentType.split('/')[1].toUpperCase()}
                      </Typography>
                    </PreviewPlaceholder>
                  )}
                </MediaPreview>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="subtitle2" noWrap title={file.name.split('/').pop()}>
                    {file.name.split('/').pop()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </CardContent>
                {!onSelect && selectedMedia?.name === file.name && (
                  <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                    <Box>
                      <Tooltip title="Prévisualiser">
                        <IconButton size="small" onClick={handlePreviewMedia}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {file.contentType.startsWith('image/') && (
                        <Tooltip title="Éditer">
                          <IconButton size="small" onClick={handleEditMedia}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                )}
              </MediaCard>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Dialogue d'upload */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Télécharger des fichiers</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="folder-label">Dossier</InputLabel>
              <Select
                labelId="folder-label"
                id="folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                label="Dossier"
                disabled={uploading}
              >
                <MenuItem value="images">Images</MenuItem>
                <MenuItem value="documents">Documents</MenuItem>
                <MenuItem value="videos">Vidéos</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Fichiers à télécharger :
            </Typography>
            
            <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2 }}>
              {uploadFiles.map((file, index) => (
                <Chip
                  key={index}
                  icon={file.type.startsWith('image/') ? <ImageIcon /> : <InsertDriveFileIcon />}
                  label={file.name}
                  sx={{ m: 0.5 }}
                  variant="outlined"
                  onDelete={uploading ? undefined : () => {
                    const newFiles = [...uploadFiles];
                    newFiles.splice(index, 1);
                    setUploadFiles(newFiles);
                  }}
                />
              ))}
            </Box>
          </Box>
          
          {uploading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            disabled={uploading}
            onClick={() => setUploadDialogOpen(false)}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={uploading || uploadFiles.length === 0}
            onClick={handleUpload}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {uploading ? 'Téléchargement...' : 'Télécharger'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Supprimer le fichier</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le fichier
            <Box component="span" fontWeight="bold" sx={{ mx: 0.5 }}>
              {selectedMedia?.name.split('/').pop()}
            </Box>
            ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteMedia}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de prévisualisation */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMedia?.name.split('/').pop()}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedMedia?.contentType.startsWith('image/') ? (
            <Box
              component="img"
              src={selectedMedia.url}
              alt={selectedMedia.name}
              sx={{ maxWidth: '100%', maxHeight: '60vh' }}
            />
          ) : (
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {renderFileIcon(selectedMedia?.contentType)}
              <Typography variant="body1" sx={{ mt: 2 }}>
                Ce type de fichier ne peut pas être prévisualisé.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                href={selectedMedia?.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                Télécharger
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue d'édition d'image (simulé) */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Éditer l'image</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedMedia && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                L'édition avancée d'images n'est pas implémentée dans cette version.
              </Typography>
              <Box
                component="img"
                src={selectedMedia.url}
                alt={selectedMedia.name}
                sx={{ maxWidth: '100%', maxHeight: '50vh', my: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CropIcon />}
                  disabled
                >
                  Recadrer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  disabled
                >
                  Ajuster
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setEditDialogOpen(false)}
          >
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaManager;