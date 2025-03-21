import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Services
import { getSiteStructure, deletePage, updatePage, getPage } from '../services/api';

// Contexts
import { useAlert } from '../contexts/AlertContext';

// Styled components
const PageListContainer = styled(Box)(({ theme }) => ({
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column'
}));

const TableToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

/**
 * Page de liste et gestion des pages du site
 */
const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filteredPages, setFilteredPages] = useState([]);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  
  // Charger la structure du site
  useEffect(() => {
    const loadSiteStructure = async () => {
      try {
        setLoading(true);
        const structure = await getSiteStructure();
        if (structure && structure.pages) {
          // Charger des informations supplémentaires pour chaque page
          const pagesWithDetails = await Promise.all(
            structure.pages.map(async (page) => {
              try {
                const pageDetails = await getPage(page.id);
                return {
                  ...page,
                  lastUpdated: pageDetails.lastUpdated || 'Inconnu',
                  author: pageDetails.author || 'Admin',
                  sections: pageDetails.sections?.length || 0
                };
              } catch (error) {
                console.error(`Erreur lors du chargement des détails de la page ${page.id}:`, error);
                return {
                  ...page,
                  lastUpdated: 'Inconnu',
                  author: 'Admin',
                  sections: 0
                };
              }
            })
          );
          
          setPages(pagesWithDetails);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la structure du site:', error);
        showError('Erreur lors du chargement des pages');
      } finally {
        setLoading(false);
      }
    };
    
    loadSiteStructure();
  }, [showError]);
  
  // Filtrer les pages en fonction du terme de recherche et du filtre de publication
  useEffect(() => {
    let filtered = pages;
    
    if (searchTerm) {
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (showPublishedOnly) {
      filtered = filtered.filter(page => page.isPublished);
    }
    
    setFilteredPages(filtered);
  }, [searchTerm, pages, showPublishedOnly]);
  
  // Gestionnaires d'événements
  const handleCreatePage = () => {
    navigate('/pages/new');
  };
  
  const handleEditPage = (pageId) => {
    navigate(`/pages/${pageId}`);
  };
  
  const handleDeleteClick = (page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;
    
    try {
      setDeleting(true);
      await deletePage(pageToDelete.id);
      
      // Mettre à jour la liste des pages
      setPages(prevPages => prevPages.filter(page => page.id !== pageToDelete.id));
      
      showSuccess('Page supprimée avec succès!');
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la page:', error);
      showError('Erreur lors de la suppression de la page');
    } finally {
      setDeleting(false);
    }
  };
  
  const handleTogglePublish = async (page) => {
    try {
      // Récupérer les données complètes de la page
      const pageData = await getPage(page.id);
      
      // Mettre à jour le statut de publication
      pageData.isPublished = !page.isPublished;
      
      // Enregistrer les modifications
      await updatePage(page.id, pageData);
      
      // Mettre à jour la liste locale des pages
      setPages(prevPages => prevPages.map(p => 
        p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
      ));
      
      showSuccess(`Page ${pageData.isPublished ? 'publiée' : 'dépubliée'} avec succès!`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de publication:', error);
      showError('Erreur lors de la mise à jour du statut de publication');
    }
  };
  
  const handleCopyUrl = (path) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${path}`;
    
    navigator.clipboard.writeText(fullUrl)
      .then(() => showSuccess('URL copiée dans le presse-papier!'))
      .catch(() => showError('Erreur lors de la copie de l\'URL'));
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Rendu des statuts en badges
  const renderStatus = (isPublished) => {
    return isPublished ? (
      <Chip 
        label="Publié" 
        color="success" 
        size="small"
      />
    ) : (
      <Chip 
        label="Brouillon" 
        color="default" 
        size="small"
      />
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
    <PageListContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des pages
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreatePage}
        >
          Nouvelle page
        </Button>
      </Box>
      
      <TableToolbar>
        <TextField
          placeholder="Rechercher une page..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
        
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showPublishedOnly}
                onChange={(e) => setShowPublishedOnly(e.target.checked)}
                color="primary"
              />
            }
            label="Pages publiées uniquement"
          />
        </Box>
      </TableToolbar>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="table des pages">
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <TableRow
                  key={page.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" fontWeight="medium">
                      {page.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {page.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1, fontFamily: 'monospace' }}>
                        {page.path}
                      </Typography>
                      <Tooltip title="Copier l'URL">
                        <IconButton 
                          size="small"
                          onClick={() => handleCopyUrl(page.path)}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{page.template}</TableCell>
                  <TableCell>{renderStatus(page.isPublished)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Modifier">
                        <IconButton onClick={() => handleEditPage(page.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={page.isPublished ? 'Dépublier' : 'Publier'}>
                        <IconButton 
                          color={page.isPublished ? 'success' : 'default'}
                          onClick={() => handleTogglePublish(page)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Supprimer">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteClick(page)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 5 }}>
                    {searchTerm 
                      ? 'Aucune page ne correspond à votre recherche'
                      : 'Aucune page trouvée'}
                  </Typography>
                  
                  {!searchTerm && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleCreatePage}
                      sx={{ mt: 1 }}
                    >
                      Créer une nouvelle page
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Supprimer la page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la page "{pageToDelete?.title}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageListContainer>
  );
};

export default PagesList;