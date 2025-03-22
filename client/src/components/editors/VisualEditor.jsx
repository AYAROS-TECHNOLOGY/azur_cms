import React, { useState, useRef } from 'react';
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
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Collapse,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CodeIcon from '@mui/icons-material/Code';
import StyleIcon from '@mui/icons-material/Style';
import AnimationIcon from '@mui/icons-material/Animation';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import TextureIcon from '@mui/icons-material/Texture';
import CropIcon from '@mui/icons-material/Crop';
import LinkIcon from '@mui/icons-material/Link';
import InputAdornment from '@mui/material/InputAdornment';


// Components
import ImageSelector from '../media/ImageSelector';
import RichTextEditor from './RichTextEditor';
import AnimationSelector from './AnimationSelector.jsx';
import ColorPicker from '../ui/ColorPicker';

// Context
import { useAlert } from '../../contexts/AlertContext';

// Styled components
const SectionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const ElementContainer = styled(Box)(({ theme, isDragging }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.light
  },
  ...(isDragging && {
    opacity: 0.5,
    borderColor: theme.palette.primary.main
  })
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
  zIndex: 10,
  '[data-element-container]:hover &': {
    opacity: 1
  }
}));

const ElementTypeIcon = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  opacity: 0.7
}));

const StyleTab = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2)
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 'auto',
  '& .MuiSvgIcon-root': {
    marginBottom: 0
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

/**
 * Éditeur visuel avancé pour les pages
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.pageData - Données de la page
 * @param {Function} props.onChange - Fonction pour mettre à jour les données
 * @param {Function} props.onPreview - Fonction pour prévisualiser la page
 */
const VisualEditor = ({ pageData, onChange, onPreview }) => {
  const [currentSection, setCurrentSection] = useState(null);
  const [currentElement, setCurrentElement] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [styleTabValue, setStyleTabValue] = useState(0);
  const [elementBeingEdited, setElementBeingEdited] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [elementListExpanded, setElementListExpanded] = useState({});
  const [showHints, setShowHints] = useState(true);
  
  const dragElementRef = useRef(null);
  const { showSuccess, showError } = useAlert();

  // Gestionnaires d'événements
  const handleAddElement = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setAddDialogOpen(true);
  };

  const handleEditElement = (sectionIndex, elementIndex) => {
    const element = {...pageData.sections[sectionIndex].content[elementIndex]};
    setCurrentSection(sectionIndex);
    setCurrentElement(elementIndex);
    setElementBeingEdited(element);
    setEditDialogOpen(true);
  };

  const handleDeleteElement = (sectionIndex, elementIndex) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      const updatedSections = [...pageData.sections];
      updatedSections[sectionIndex].content.splice(elementIndex, 1);
      
      onChange({
        ...pageData,
        sections: updatedSections
      });
      showSuccess('Élément supprimé avec succès');
    }
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
    setEditDialogOpen(false);
    setAddDialogOpen(false);
    setCurrentSection(null);
    setCurrentElement(null);
    setNewElementType('');
    setElementBeingEdited(null);
    setStyleTabValue(0);
  };

  const handleStyleTabChange = (event, newValue) => {
    setStyleTabValue(newValue);
  };

  const handleSelectImage = (imageUrl) => {
    if (!elementBeingEdited) return;
    
    setElementBeingEdited({
      ...elementBeingEdited,
      src: imageUrl
    });
    
    setImageDialogOpen(false);
  };

  const handleAddNewElement = () => {
    if (!newElementType || currentSection === null) return;
    
    const updatedSections = [...pageData.sections];
    const section = updatedSections[currentSection];
    
    // Générer un ID unique pour le nouvel élément
    const elementId = `${newElementType}-${Date.now()}`;
    
    let newElement;
    
    switch (newElementType) {
      case 'heading':
        newElement = {
          id: elementId,
          type: 'heading',
          text: 'Nouveau titre',
          level: 2,
          className: '',
          animation: '',
          style: {}
        };
        break;
      case 'paragraph':
        newElement = {
          id: elementId,
          type: 'paragraph',
          text: 'Nouveau paragraphe de texte...',
          className: '',
          animation: '',
          style: {}
        };
        break;
      case 'image':
        newElement = {
          id: elementId,
          type: 'image',
          src: 'https://via.placeholder.com/400x200',
          alt: 'Image descriptive',
          className: '',
          animation: '',
          style: {}
        };
        break;
      case 'button':
        newElement = {
          id: elementId,
          type: 'button',
          text: 'Bouton',
          url: '#',
          className: '',
          animation: '',
          style: {}
        };
        break;
      case 'divider':
        newElement = {
          id: elementId,
          type: 'divider',
          className: '',
          style: {}
        };
        break;
      case 'container':
        newElement = {
          id: elementId,
          type: 'container',
          className: '',
          content: [],
          animation: '',
          style: {}
        };
        break;
      default:
        newElement = {
          id: elementId,
          type: newElementType,
          text: `Élément ${newElementType}`,
          className: '',
          style: {}
        };
    }
    
    // Ajouter le nouvel élément à la section
    section.content.push(newElement);
    
    onChange({
      ...pageData,
      sections: updatedSections
    });
    
    showSuccess(`Élément ${newElementType} ajouté avec succès`);
    setAddDialogOpen(false);
    setNewElementType('');
  };

  const handleEditDialogSave = () => {
    if (!elementBeingEdited || currentSection === null || currentElement === null) return;
    
    const updatedSections = [...pageData.sections];
    updatedSections[currentSection].content[currentElement] = elementBeingEdited;
    
    onChange({
      ...pageData,
      sections: updatedSections
    });
    
    showSuccess('Élément mis à jour avec succès');
    setEditDialogOpen(false);
  };

  const handleElementValueChange = (field, value) => {
    if (!elementBeingEdited) return;
    
    setElementBeingEdited({
      ...elementBeingEdited,
      [field]: value
    });
  };

  const handleElementStyleChange = (property, value) => {
    if (!elementBeingEdited) return;
    
    setElementBeingEdited({
      ...elementBeingEdited,
      style: {
        ...elementBeingEdited.style,
        [property]: value
      }
    });
  };

  // Drag and drop functions
  const handleDragStart = (e, sectionIndex, elementIndex) => {
    setDraggedElement({ sectionIndex, elementIndex });
    e.currentTarget.style.opacity = '0.4';
    dragElementRef.current = e.currentTarget;
  };

  const handleDragEnd = (e) => {
    if (dragElementRef.current) {
      dragElementRef.current.style.opacity = '1';
    }
    setDraggedElement(null);
  };

  const handleDragOver = (e, sectionIndex, elementIndex) => {
    e.preventDefault();
    if (!draggedElement) return;
    
    const { sectionIndex: fromSectionIndex, elementIndex: fromElementIndex } = draggedElement;
    
    // Don't do anything if dragging over self
    if (fromSectionIndex === sectionIndex && fromElementIndex === elementIndex) return;
    
    const updatedSections = [...pageData.sections];
    
    // Get the dragged element
    const draggedItem = {...updatedSections[fromSectionIndex].content[fromElementIndex]};
    
    // Remove from original position
    updatedSections[fromSectionIndex].content.splice(fromElementIndex, 1);
    
    // Add to new position
    updatedSections[sectionIndex].content.splice(elementIndex, 0, draggedItem);
    
    onChange({
      ...pageData,
      sections: updatedSections
    });
    
    // Update the dragged element reference
    setDraggedElement({ sectionIndex, elementIndex: fromElementIndex > elementIndex ? elementIndex : elementIndex - 1 });
  };

  const toggleSectionExpand = (sectionId) => {
    setElementListExpanded({
      ...elementListExpanded,
      [sectionId]: !elementListExpanded[sectionId]
    });
  };

  // Rendu des éléments en fonction de leur type
  const renderElement = (element, sectionIndex, elementIndex) => {
    let styleObj = {};
    
    // Convert style object to CSS object
    if (element.style) {
      styleObj = { ...element.style };
      
      // Handle animations if available
      if (element.animation) {
        styleObj.animation = element.animation;
      }
    }
    
    switch (element.type) {
      case 'heading':
        return (
          <Typography 
            variant={`h${element.level || 2}`} 
            className={element.className || ''}
            style={styleObj}
          >
            {element.text || 'Titre'}
          </Typography>
        );
      case 'paragraph':
        return (
          <Typography 
            variant="body1" 
            className={element.className || ''}
            style={styleObj}
          >
            {element.text || 'Texte du paragraphe...'}
          </Typography>
        );
      case 'image':
        return (
          <Box style={styleObj} className={element.className || ''}>
            <img 
              src={element.src || 'https://via.placeholder.com/400x200'} 
              alt={element.alt || ''} 
              style={{ maxWidth: '100%', height: 'auto', ...styleObj }} 
            />
          </Box>
        );
      case 'button':
        return (
          <Button 
            variant="contained" 
            color="primary"
            className={element.className || ''}
            style={styleObj}
          >
            {element.text || 'Bouton'}
          </Button>
        );
      case 'divider':
        return <Divider style={styleObj} className={element.className || ''} />;
      case 'container':
        return (
          <Box 
            style={styleObj} 
            className={element.className || ''}
            sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}
          >
            <Typography variant="caption" color="text.secondary">Conteneur</Typography>
            {element.content && element.content.length > 0 ? (
              element.content.map((childElement, childIndex) => (
                <Box key={childIndex}>
                  {renderElement(childElement, sectionIndex, `${elementIndex}-${childIndex}`)}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                Conteneur vide
              </Typography>
            )}
          </Box>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Élément de type {element.type}
          </Typography>
        );
    }
  };

  // Render element editor based on type
  const renderElementEditor = () => {
    if (!elementBeingEdited) return null;
    
    // Common tabs for all element types
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={styleTabValue} 
            onChange={handleStyleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            aria-label="element editor tabs"
          >
            <StyledTab icon={<TextFieldsIcon />} label="Contenu" />
            <StyledTab icon={<StyleIcon />} label="Style" />
            <StyledTab icon={<AnimationIcon />} label="Animation" />
            <StyledTab icon={<CodeIcon />} label="Avancé" />
          </Tabs>
        </Box>
        
        {/* Content Tab */}
        {styleTabValue === 0 && (
          <StyleTab>
            {renderContentEditor()}
          </StyleTab>
        )}
        
        {/* Style Tab */}
        {styleTabValue === 1 && (
          <StyleTab>
            <Typography variant="subtitle2" gutterBottom>Apparence</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Classe CSS"
                  value={elementBeingEdited.className || ''}
                  onChange={(e) => handleElementValueChange('className', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID"
                  value={elementBeingEdited.id || ''}
                  onChange={(e) => handleElementValueChange('id', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Couleur du texte</InputLabel>
                  <Box sx={{ display: 'flex', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setImageDialogOpen(true)} 
                      startIcon={<FormatColorFillIcon />}
                      size="small"
                    >
                      Choisir
                    </Button>
                    <Box 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        ml: 2, 
                        backgroundColor: elementBeingEdited.style?.color || 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: 1
                      }} 
                    />
                  </Box>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Arrière-plan</InputLabel>
                  <Box sx={{ display: 'flex', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setImageDialogOpen(true)} 
                      startIcon={<FormatColorFillIcon />}
                      size="small"
                    >
                      Choisir
                    </Button>
                    <Box 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        ml: 2, 
                        backgroundColor: elementBeingEdited.style?.backgroundColor || 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: 1
                      }} 
                    />
                  </Box>
                </FormControl>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Dimensions</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Largeur"
                  value={elementBeingEdited.style?.width || ''}
                  onChange={(e) => handleElementStyleChange('width', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  size="small"
                  placeholder="100%, 200px, auto"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hauteur"
                  value={elementBeingEdited.style?.height || ''}
                  onChange={(e) => handleElementStyleChange('height', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  size="small"
                  placeholder="100px, auto"
                />
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Espacement</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marge externe"
                  value={elementBeingEdited.style?.margin || ''}
                  onChange={(e) => handleElementStyleChange('margin', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  size="small"
                  placeholder="10px 5px 10px 5px"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Remplissage interne"
                  value={elementBeingEdited.style?.padding || ''}
                  onChange={(e) => handleElementStyleChange('padding', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  size="small"
                  placeholder="10px 5px 10px 5px"
                />
              </Grid>
            </Grid>
          </StyleTab>
        )}
        
        {/* Animation Tab */}
        {styleTabValue === 2 && (
          <StyleTab>
            <Typography variant="subtitle2" gutterBottom>Animation</Typography>
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Type d'animation</InputLabel>
              <Select
                value={elementBeingEdited.animation || ''}
                onChange={(e) => handleElementValueChange('animation', e.target.value)}
                label="Type d'animation"
              >
                <MenuItem value="">Aucune animation</MenuItem>
                <MenuItem value="fade-in 0.5s ease">Fondu entrant</MenuItem>
                <MenuItem value="slide-in-left 0.5s ease">Glisser depuis la gauche</MenuItem>
                <MenuItem value="slide-in-right 0.5s ease">Glisser depuis la droite</MenuItem>
                <MenuItem value="slide-in-top 0.5s ease">Glisser depuis le haut</MenuItem>
                <MenuItem value="slide-in-bottom 0.5s ease">Glisser depuis le bas</MenuItem>
                <MenuItem value="zoom-in 0.5s ease">Zoom entrant</MenuItem>
                <MenuItem value="bounce 1s ease">Rebondissement</MenuItem>
                <MenuItem value="rotate 1s linear infinite">Rotation continue</MenuItem>
                <MenuItem value="pulse 2s ease infinite">Pulsation</MenuItem>
                <MenuItem value="custom">Personnalisée...</MenuItem>
              </Select>
            </FormControl>
            
            {elementBeingEdited.animation === 'custom' && (
              <TextField
                fullWidth
                label="Animation CSS personnalisée"
                value={elementBeingEdited.customAnimation || ''}
                onChange={(e) => handleElementValueChange('customAnimation', e.target.value)}
                variant="outlined"
                margin="normal"
                size="small"
                placeholder="nom-animation 1s ease"
                multiline
                rows={2}
              />
            )}
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Délai et durée</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Délai avant animation</Typography>
                <Slider
                  value={parseInt(elementBeingEdited.style?.animationDelay || '0')}
                  onChange={(e, value) => handleElementStyleChange('animationDelay', `${value}ms`)}
                  min={0}
                  max={3000}
                  step={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}ms`}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Durée de l'animation</Typography>
                <Slider
                  value={parseInt(elementBeingEdited.style?.animationDuration || '500')}
                  onChange={(e, value) => handleElementStyleChange('animationDuration', `${value}ms`)}
                  min={100}
                  max={5000}
                  step={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}ms`}
                />
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch
                  checked={elementBeingEdited.style?.animationIterationCount === 'infinite'}
                  onChange={(e) => handleElementStyleChange('animationIterationCount', e.target.checked ? 'infinite' : '1')}
                />
              }
              label="Animation en boucle"
              sx={{ mt: 2 }}
            />
            
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Prévisualisation des animations disponible dans l'aperçu de la page.
              </Typography>
            </Box>
          </StyleTab>
        )}
        
        {/* Advanced Tab */}
        {styleTabValue === 3 && (
          <StyleTab>
            <Typography variant="subtitle2" gutterBottom>Code CSS personnalisé</Typography>
            
            <TextField
              fullWidth
              label="Style CSS"
              value={elementBeingEdited.customCSS || ''}
              onChange={(e) => handleElementValueChange('customCSS', e.target.value)}
              variant="outlined"
              margin="normal"
              size="small"
              multiline
              rows={4}
              placeholder="color: red; font-weight: bold;"
            />
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Attributs de données</Typography>
            
            <TextField
              fullWidth
              label="Attributs data-*"
              value={elementBeingEdited.dataAttributes || ''}
              onChange={(e) => handleElementValueChange('dataAttributes', e.target.value)}
              variant="outlined"
              margin="normal"
              size="small"
              placeholder="data-custom=value, data-id=123"
              helperText="Séparez les attributs par des virgules"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={elementBeingEdited.hidden || false}
                  onChange={(e) => handleElementValueChange('hidden', e.target.checked)}
                />
              }
              label="Cacher cet élément"
              sx={{ mt: 2 }}
            />
          </StyleTab>
        )}
      </Box>
    );
  };

  // Render content editor based on element type
  const renderContentEditor = () => {
    if (!elementBeingEdited) return null;
    
    switch (elementBeingEdited.type) {
      case 'heading':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Texte du titre"
                  value={elementBeingEdited.text || ''}
                  onChange={(e) => handleElementValueChange('text', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Niveau du titre</InputLabel>
                  <Select
                    value={elementBeingEdited.level || 2}
                    onChange={(e) => handleElementValueChange('level', e.target.value)}
                    label="Niveau du titre"
                  >
                    <MenuItem value={1}>H1 (Titre principal)</MenuItem>
                    <MenuItem value={2}>H2 (Sous-titre)</MenuItem>
                    <MenuItem value={3}>H3 (Titre de section)</MenuItem>
                    <MenuItem value={4}>H4 (Sous-titre de section)</MenuItem>
                    <MenuItem value={5}>H5 (Titre mineur)</MenuItem>
                    <MenuItem value={6}>H6 (Sous-titre mineur)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Alignement</InputLabel>
                  <Select
                    value={elementBeingEdited.style?.textAlign || 'left'}
                    onChange={(e) => handleElementStyleChange('textAlign', e.target.value)}
                    label="Alignement"
                  >
                    <MenuItem value="left">Gauche</MenuItem>
                    <MenuItem value="center">Centré</MenuItem>
                    <MenuItem value="right">Droite</MenuItem>
                    <MenuItem value="justify">Justifié</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        );
        
      case 'paragraph':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RichTextEditor
                  value={elementBeingEdited.text || ''}
                  onChange={(content) => handleElementValueChange('text', content)}
                  label="Contenu du paragraphe"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Alignement</InputLabel>
                  <Select
                    value={elementBeingEdited.style?.textAlign || 'left'}
                    onChange={(e) => handleElementStyleChange('textAlign', e.target.value)}
                    label="Alignement"
                  >
                    <MenuItem value="left">Gauche</MenuItem>
                    <MenuItem value="center">Centré</MenuItem>
                    <MenuItem value="right">Droite</MenuItem>
                    <MenuItem value="justify">Justifié</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Importance</InputLabel>
                  <Select
                    value={elementBeingEdited.style?.fontWeight || 'normal'}
                    onChange={(e) => handleElementStyleChange('fontWeight', e.target.value)}
                    label="Importance"
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="bold">Gras</MenuItem>
                    <MenuItem value="lighter">Léger</MenuItem>
                    <MenuItem value="bolder">Très gras</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        );
        
      case 'image':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <img 
                    src={elementBeingEdited.src || 'https://via.placeholder.com/400x200'} 
                    alt={elementBeingEdited.alt || ''} 
                    style={{ maxWidth: '100%', height: 'auto' }} 
                  />
                </Box>
                
                <Button 
                  variant="outlined" 
                  onClick={() => setImageDialogOpen(true)}
                  startIcon={<ImageIcon />}
                  fullWidth
                >
                  Choisir une image
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Texte alternatif"
                  value={elementBeingEdited.alt || ''}
                  onChange={(e) => handleElementValueChange('alt', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  helperText="Important pour l'accessibilité et le référencement"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Ajustement</InputLabel>
                  <Select
                    value={elementBeingEdited.style?.objectFit || 'cover'}
                    onChange={(e) => handleElementStyleChange('objectFit', e.target.value)}
                    label="Ajustement"
                  >
                    <MenuItem value="cover">Remplir (cover)</MenuItem>
                    <MenuItem value="contain">Contenir (contain)</MenuItem>
                    <MenuItem value="fill">Étirer (fill)</MenuItem>
                    <MenuItem value="none">Aucun (none)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<CropIcon />}
                    size="small"
                  >
                    Recadrer
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<FormatSizeIcon />}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    Redimensionner
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </>
        );
        
      case 'button':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Texte du bouton"
                  value={elementBeingEdited.text || ''}
                  onChange={(e) => handleElementValueChange('text', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="URL / Lien"
                  value={elementBeingEdited.url || '#'}
                  onChange={(e) => handleElementValueChange('url', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Variante</InputLabel>
                  <Select
                    value={elementBeingEdited.variant || 'contained'}
                    onChange={(e) => handleElementValueChange('variant', e.target.value)}
                    label="Variante"
                  >
                    <MenuItem value="contained">Plein (contained)</MenuItem>
                    <MenuItem value="outlined">Contour (outlined)</MenuItem>
                    <MenuItem value="text">Texte (text)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Couleur</InputLabel>
                  <Select
                    value={elementBeingEdited.color || 'primary'}
                    onChange={(e) => handleElementValueChange('color', e.target.value)}
                    label="Couleur"
                  >
                    <MenuItem value="primary">Principale</MenuItem>
                    <MenuItem value="secondary">Secondaire</MenuItem>
                    <MenuItem value="success">Succès</MenuItem>
                    <MenuItem value="error">Erreur</MenuItem>
                    <MenuItem value="warning">Avertissement</MenuItem>
                    <MenuItem value="info">Information</MenuItem>
                    <MenuItem value="inherit">Héritée</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        );
        
      case 'divider':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Orientation</InputLabel>
                  <Select
                    value={elementBeingEdited.orientation || 'horizontal'}
                    onChange={(e) => handleElementValueChange('orientation', e.target.value)}
                    label="Orientation"
                  >
                    <MenuItem value="horizontal">Horizontale</MenuItem>
                    <MenuItem value="vertical">Verticale</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Épaisseur (px)"
                  value={elementBeingEdited.style?.borderWidth || '1'}
                  onChange={(e) => handleElementStyleChange('borderWidth', e.target.value + 'px')}
                  variant="outlined"
                  margin="normal"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />
              </Grid>
            </Grid>
          </>
        );
        
      case 'container':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Un conteneur permet de regrouper plusieurs éléments et de les styliser ensemble.
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={elementBeingEdited.style?.flexDirection || 'column'}
                    onChange={(e) => handleElementStyleChange('flexDirection', e.target.value)}
                    label="Direction"
                  >
                    <MenuItem value="row">Horizontale (row)</MenuItem>
                    <MenuItem value="column">Verticale (column)</MenuItem>
                    <MenuItem value="row-reverse">Horizontale inversée</MenuItem>
                    <MenuItem value="column-reverse">Verticale inversée</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Alignement</InputLabel>
                  <Select
                    value={elementBeingEdited.style?.justifyContent || 'flex-start'}
                    onChange={(e) => handleElementStyleChange('justifyContent', e.target.value)}
                    label="Alignement"
                  >
                    <MenuItem value="flex-start">Début</MenuItem>
                    <MenuItem value="center">Centre</MenuItem>
                    <MenuItem value="flex-end">Fin</MenuItem>
                    <MenuItem value="space-between">Espace entre</MenuItem>
                    <MenuItem value="space-around">Espace autour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                >
                  Ajouter un élément enfant
                </Button>
              </Grid>
            </Grid>
          </>
        );
        
      default:
        return (
          <Typography variant="body1" color="text.secondary">
            Éditeur non disponible pour le type {elementBeingEdited.type}
          </Typography>
        );
    }
  };

  // Render element type icon
  const getElementTypeIcon = (type) => {
    switch (type) {
      case 'heading': return <FormatSizeIcon fontSize="small" />;
      case 'paragraph': return <TextFieldsIcon fontSize="small" />;
      case 'image': return <ImageIcon fontSize="small" />;
      case 'button': return <SmartButtonIcon fontSize="small" />;
      case 'divider': return <ViewColumnIcon fontSize="small" />;
      case 'container': return <ViewColumnIcon fontSize="small" />;
      default: return <TextureIcon fontSize="small" />;
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

      <Collapse in={showHints}>
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          onClose={() => setShowHints(false)}
        >
          Astuce : Faites glisser les éléments pour les réorganiser. Cliquez sur l'icône de modification pour éditer les propriétés d'un élément.
        </Alert>
      </Collapse>

      {/* Sections de la page */}
      {pageData.sections && pageData.sections.map((section, sectionIndex) => (
        <SectionContainer key={section.id || sectionIndex}>
          <SectionHeader>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">
                {section.type === 'header' 
                  ? 'En-tête' 
                  : section.type === 'footer' 
                    ? 'Pied de page' 
                    : `Section: ${section.className || section.id || sectionIndex + 1}`
                }
              </Typography>
              <IconButton
                size="small"
                onClick={() => toggleSectionExpand(section.id)}
                sx={{ ml: 1 }}
              >
                {elementListExpanded[section.id] ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </IconButton>
            </Box>
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
          <Collapse in={elementListExpanded[section.id] !== false}>
            {section.content && section.content.length > 0 ? (
              section.content.map((element, elementIndex) => (
                <ElementContainer 
                  key={element.id || `${sectionIndex}-${elementIndex}`}
                  data-element-container
                  isDragging={draggedElement?.sectionIndex === sectionIndex && draggedElement?.elementIndex === elementIndex}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sectionIndex, elementIndex)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, sectionIndex, elementIndex)}
                >
                  <ElementTypeIcon>
                    {getElementTypeIcon(element.type)}
                  </ElementTypeIcon>
                  
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
                  
                  <Box sx={{ pl: 4 }}>
                    {renderElement(element, sectionIndex, elementIndex)}
                  </Box>
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
          </Collapse>
        </SectionContainer>
      ))}

      {/* Dialogues */}
      {/* Dialogue d'ajout d'élément */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ajouter un élément</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  border: newElementType === 'heading' ? 2 : 1,
                  borderColor: newElementType === 'heading' ? 'primary.main' : 'divider',
                }}
                onClick={() => setNewElementType('heading')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <FormatSizeIcon color="primary" fontSize="large" />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    Titre
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ajouter un titre ou sous-titre
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  border: newElementType === 'paragraph' ? 2 : 1,
                  borderColor: newElementType === 'paragraph' ? 'primary.main' : 'divider',
                }}
                onClick={() => setNewElementType('paragraph')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <TextFieldsIcon color="primary" fontSize="large" />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    Paragraphe
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ajouter un texte
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  border: newElementType === 'image' ? 2 : 1,
                  borderColor: newElementType === 'image' ? 'primary.main' : 'divider',
                }}
                onClick={() => setNewElementType('image')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <ImageIcon color="primary" fontSize="large" />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ajouter une image
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  border: newElementType === 'button' ? 2 : 1,
                  borderColor: newElementType === 'button' ? 'primary.main' : 'divider',
                }}
                onClick={() => setNewElementType('button')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <SmartButtonIcon color="primary" fontSize="large" />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    Bouton
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ajouter un bouton
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  border: newElementType === 'divider' ? 2 : 1,
                  borderColor: newElementType === 'divider' ? 'primary.main' : 'divider',
                }}
                onClick={() => setNewElementType('divider')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <ViewColumnIcon color="primary" fontSize="large" />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    Séparateur
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ajouter une ligne de séparation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  border: newElementType === 'container' ? 2 : 1,
                  borderColor: newElementType === 'container' ? 'primary.main' : 'divider',
                }}
                onClick={() => setNewElementType('container')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <ViewColumnIcon color="primary" fontSize="large" />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    Conteneur
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ajouter un bloc conteneur
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
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddNewElement}
            disabled={!newElementType}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'édition d'élément */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Édition de l'élément {elementBeingEdited?.type}
        </DialogTitle>
        <DialogContent dividers>
          {renderElementEditor()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleEditDialogSave}
          >
            Enregistrer
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