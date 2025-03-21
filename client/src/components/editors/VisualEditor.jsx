// client/src/components/editors/VisualEditor.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Components
import ImageSelector from '../media/ImageSelector';

// Styled components
const SectionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const ElementContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const ElementActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease',
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  '[data-element-container]:hover &': {
    opacity: 1
  }
}));

/**
 * Éditeur visuel pour les pages
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.pageData - Données de la page
 * @param {Function} props.onChange - Fonction pour mettre à jour les données
 * @param {Function} props.onPreview - Fonction pour prévisualiser la page
 */
const VisualEditor = ({ pageData, onChange, onPreview }) => {
  const [currentSection, setCurrentSection] = useState(null);
  const [currentElement, setCurrentElement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Gestionnaires d'événements
  const handleAddElement = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setAddDialogOpen(true);
  };

  const handleEditElement = (sectionIndex, elementIndex) => {
    setCurrentSection(sectionIndex);
    setCurrentElement(elementIndex);
    setDialogOpen(true);
  };

  const handleDeleteElement = (sectionIndex, elementIndex) => {
    const updatedSections = [...pageData.sections];
    updatedSections[sectionIndex].content.splice(elementIndex, 1);
    
    onChange({
      ...pageData,
      sections: updatedSections
    });
  };

  const handleMoveElement = (sectionIndex, elementIndex, direction) => {
    const updatedSections = [...pageData.sections];
    const elements = updatedSections[sectionIndex].content;
    
    if (direction === 'up' && elementIndex > 0) {
      // Swap with previous element
      [elements[elementIndex], elements[elementIndex - 1]] = [elements[elementIndex - 1], elements[elementIndex]];
    } else if (direction === 'down' && elementIndex < elements.length - 1) {
      // Swap with next element
      [elements[elementIndex], elements[elementIndex + 1]] = [elements[elementIndex + 1], elements[elementIndex]];
    }
    
    onChange({
      ...pageData,
      sections: updatedSections
    });
  };

  const handleCloseDialogs = () => {
    setDialogOpen(false);
    setAddDialogOpen(false);
    setCurrentSection(null);
    setCurrentElement(null);
    setNewElementType('');
  };

  const handleSelectImage = (imageUrl) => {
    // Logic to handle image selection
    setImageDialogOpen(false);
  };

  // Rendu des éléments en fonction de leur type
  const renderElement = (element, sectionIndex, elementIndex) => {
    switch (element.type) {
      case 'heading':
        return (
          <Typography variant={`h${element.level || 2}`}>
            {element.text || 'Titre'}
          </Typography>
        );
      case 'paragraph':
        return (
          <Typography variant="body1">
            {element.text || 'Texte du paragraphe...'}
          </Typography>
        );
      case 'image':
        return (
          <Box>
            <img 
              src={element.src || 'https://via.placeholder.com/400x200'} 
              alt={element.alt || ''} 
              style={{ maxWidth: '100%', height: 'auto' }} 
            />
          </Box>
        );
      case 'button':
        return (
          <Button 
            variant="contained" 
            color="primary"
          >
            {element.text || 'Bouton'}
          </Button>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Élément de type {element.type}
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">
          Éditeur visuel
        </Typography>
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={onPreview}
        >
          Prévisualiser
        </Button>
      </Box>

      {/* Sections de la page */}
      {pageData.sections && pageData.sections.map((section, sectionIndex) => (
        <SectionContainer key={section.id || sectionIndex}>
          <SectionHeader>
            <Typography variant="h6">
              {section.type === 'header' 
                ? 'En-tête' 
                : section.type === 'footer' 
                  ? 'Pied de page' 
                  : `Section: ${section.className || section.id || sectionIndex + 1}`
              }
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAddElement(sectionIndex)}
            >
              Ajouter un élément
            </Button>
          </SectionHeader>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Éléments de la section */}
          {section.content && section.content.length > 0 ? (
            section.content.map((element, elementIndex) => (
              <ElementContainer 
                key={element.id || `${sectionIndex}-${elementIndex}`}
                data-element-container
              >
                <ElementActions>
                  <Tooltip title="Déplacer vers le haut">
                    <IconButton 
                      size="small"
                      onClick={() => handleMoveElement(sectionIndex, elementIndex, 'up')}
                      disabled={elementIndex === 0}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Déplacer vers le bas">
                    <IconButton 
                      size="small"
                      onClick={() => handleMoveElement(sectionIndex, elementIndex, 'down')}
                      disabled={elementIndex === section.content.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton 
                      size="small"
                      onClick={() => handleEditElement(sectionIndex, elementIndex)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => handleDeleteElement(sectionIndex, elementIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ElementActions>
                
                {renderElement(element, sectionIndex, elementIndex)}
              </ElementContainer>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body2" gutterBottom>
                Aucun élément dans cette section
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddElement(sectionIndex)}
              >
                Ajouter un élément
              </Button>
            </Box>
          )}
        </SectionContainer>
      ))}

      {/* Dialogues */}
      {/* Dialogue d'ajout d'élément */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajouter un élément</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%'
                }}
                onClick={() => setNewElementType('heading')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Titre
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajouter un titre ou sous-titre
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%'
                }}
                onClick={() => setNewElementType('paragraph')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paragraphe
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajouter un texte
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%'
                }}
                onClick={() => setNewElementType('image')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajouter une image
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%'
                }}
                onClick={() => setNewElementType('button')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bouton
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajouter un bouton
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sélecteur d'images */}
      <ImageSelector
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSelect={handleSelectImage}
      />
    </Box>
  );
};

export default VisualEditor;