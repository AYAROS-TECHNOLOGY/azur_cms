// client/src/pages/PageEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';

// Components
import VisualEditor from '../components/editors/VisualEditor';
import MetadataEditor from '../components/editors/MetadataEditor';
import PreviewDialog from '../components/preview/PreviewDialog';

// Contexts
import { useAlert } from '../contexts/AlertContext';

// Services
import { getPage, createPage, updatePage, deletePage, getSiteStructure } from '../services/api';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

/**
 * Interface pour créer et modifier des pages
 */
const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState({
    title: '',
    meta: {
      description: '',
      keywords: ''
    },
    path: '',
    template: 'default',
    isPublished: false,
    sections: []
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const isNewPage = !pageId || pageId === 'new';
  
  // Charger les données de la page existante ou initialiser une nouvelle page
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        
        if (isNewPage) {
          // Pour une nouvelle page, initialiser avec des valeurs par défaut
          const defaultData = {
            title: 'Nouvelle page',
            meta: {
              description: '',
              keywords: ''
            },
            path: '/nouvelle-page',
            template: 'default',
            isPublished: false,
            sections: [
              {
                id: 'header',
                type: 'header',
                className: 'header',
                content: []
              },
              {
                id: 'main-content',
                type: 'section',
                className: 'main-content',
                content: []
              },
              {
                id: 'footer',
                type: 'footer',
                className: 'footer',
                content: []
              }
            ]
          };
          
          setPageData(defaultData);
          setOriginalData(JSON.stringify(defaultData));
        } else {
          // Charger les données d'une page existante
          const data = await getPage(pageId);
          setPageData(data);
          setOriginalData(JSON.stringify(data));
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        showError('Erreur lors du chargement de la page');
        navigate('/pages');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [pageId, isNewPage, navigate, showError]);
  
  // Vérifier s'il y a des modifications non enregistrées
  useEffect(() => {
    if (originalData) {
      setHasChanges(JSON.stringify(pageData) !== originalData);
    }
  }, [pageData, originalData]);
  
  // Vérifier les modifications non enregistrées avant de quitter
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);
  
  // Gestionnaires d'événements
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleBasicInfoChange = (field, value) => {
    setPageData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleMetaChange = (field, value) => {
    setPageData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value
      }
    }));
  };
  
  const handleVisualEditorChange = (updatedData) => {
    setPageData(prev => ({
      ...prev,
      ...updatedData
    }));
  };
  
  const handlePreview = () => {
    setShowPreview(true);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validation de base
      if (!pageData.title) {
        showError('Le titre de la page est requis');
        return;
      }
      
      if (!pageData.path) {
        showError('Le chemin de la page est requis');
        return;
      }
      
      // Créer ou mettre à jour la page
      if (isNewPage) {
        // Générer un ID à partir du titre
        const generatedId = pageData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        // Ajouter la page à la navigation principale
        await createPage({
          pageContent: pageData,
          pageId: generatedId,
          addToNavigation: 'main'
        });
        
        showSuccess('Page créée avec succès !');
        navigate(`/pages/${generatedId}`);
      } else {
        await updatePage(pageId, pageData);
        setOriginalData(JSON.stringify(pageData));
        showSuccess('Page enregistrée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la page:', error);
      showError('Erreur lors de l\'enregistrement de la page');
    } finally {
      setSaving(false);
    }
  };
  
  const handleBack = () => {
    if (hasChanges) {
      setPendingAction('back');
      setUnsavedChangesDialogOpen(true);
    } else {
      navigate('/pages');
    }
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deletePage(pageId);
      showSuccess('Page supprimée avec succès !');
      navigate('/pages');
    } catch (error) {
      console.error('Erreur lors de la suppression de la page:', error);
      showError('Erreur lors de la suppression de la page');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleUnsavedChangesClose = (shouldSave) => {
    setUnsavedChangesDialogOpen(false);
    
    if (shouldSave) {
      handleSave().then(() => {
        if (pendingAction === 'back') {
          navigate('/pages');
        }
      });
    } else {
      if (pendingAction === 'back') {
        navigate('/pages');
      }
    }
    
    setPendingAction(null);
  };
  
  // Rendu des onglets pour l'éditeur
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Éditeur visuel
        return (
          <VisualEditor
            pageData={pageData}
            onChange={handleVisualEditorChange}
            onPreview={handlePreview}
          />
        );
      case 1: // Métadonnées et SEO
        return (
          <MetadataEditor
            pageData={pageData}
            onMetaChange={handleMetaChange}
          />
        );
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* En-tête de la page */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Accueil
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href="/pages"
              onClick={(e) => {
                e.preventDefault();
                navigate('/pages');
              }}
            >
              Pages
            </Link>
            <Typography color="text.primary">
              {isNewPage ? 'Nouvelle page' : pageData.title}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1">
              {isNewPage ? 'Créer une nouvelle page' : 'Modifier la page'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handlePreview}
            >
              Prévisualiser
            </Button>
            {!isNewPage && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={saving}
              >
                Supprimer
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Informations de base */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Titre de la page"
              variant="outlined"
              fullWidth
              value={pageData.title}
              onChange={(e) => handleBasicInfoChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Chemin d'accès"
              variant="outlined"
              fullWidth
              value={pageData.path}
              onChange={(e) => handleBasicInfoChange('path', e.target.value)}
              placeholder="/exemple-de-page"
              helperText="Le chemin d'accès doit commencer par un /"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Template"
              variant="outlined"
              fullWidth
              value={pageData.template}
              onChange={(e) => handleBasicInfoChange('template', e.target.value)}
              SelectProps={{
                native: true
              }}
            >
              <option value="default">Par défaut</option>
              <option value="home">Accueil</option>
              <option value="contact">Contact</option>
              <option value="blog">Blog</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={pageData.isPublished}
                  onChange={(e) => handleBasicInfoChange('isPublished', e.target.checked)}
                  color="primary"
                />
              }
              label="Publier la page"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Onglets d'édition */}
      <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="page editor tabs">
        <Tab label="Éditeur visuel" />
        <Tab label="Métadonnées et SEO" />
      </StyledTabs>

      {/* Contenu de l'onglet actif */}
      <Box sx={{ mb: 3 }}>
        {renderTabContent()}
      </Box>

      {/* Actions en bas de page */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
        >
          Annuler
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

      {/* Dialogue de prévisualisation */}
      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        pageData={pageData}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Supprimer la page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la page "{pageData.title}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={saving}
          >
            {saving ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de modifications non enregistrées */}
      <Dialog
        open={unsavedChangesDialogOpen}
        onClose={() => setUnsavedChangesDialogOpen(false)}
      >
        <DialogTitle>Modifications non enregistrées</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de quitter ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleUnsavedChangesClose(false)} color="error">
            Ne pas enregistrer
          </Button>
          <Button 
            onClick={() => handleUnsavedChangesClose(true)} 
            color="primary" 
            variant="contained"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PageEditor;