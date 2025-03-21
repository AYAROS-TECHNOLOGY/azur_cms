import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PublishIcon from '@mui/icons-material/Publish';
import PaletteIcon from '@mui/icons-material/Palette';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Services
import { getSiteStructure, getMediaList, getVersions, publishSite } from '../services/api';

// Contexts
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [siteStructure, setSiteStructure] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();

  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Charger les données en parallèle
        const [structureData, mediaData, versionsData] = await Promise.all([
          getSiteStructure(),
          getMediaList(),
          getVersions()
        ]);
        
        setSiteStructure(structureData);
        setMediaFiles(mediaData);
        setVersions(versionsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        showError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  // Publier le site
  const handlePublish = async () => {
    try {
      setPublishing(true);
      await publishSite();
      showSuccess('Site publié avec succès!');
    } catch (error) {
      console.error('Erreur lors de la publication du site:', error);
      showError('Erreur lors de la publication du site');
    } finally {
      setPublishing(false);
    }
  };

  // Navigation vers les différentes sections
  const navigateToPages = () => navigate('/pages');
  const navigateToMedia = () => navigate('/media');
  const navigateToTheme = () => navigate('/theme');
  const navigateToVersions = () => navigate('/versions');
  const navigateToPageEditor = (pageId) => navigate(`/pages/${pageId}`);
  const navigateToNewPage = () => navigate('/pages/new');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Nombre de pages publiées
  const publishedPagesCount = siteStructure ? 
    siteStructure.pages.filter(page => page.isPublished).length : 0;
  
  // Date de la dernière mise à jour
  const lastUpdate = versions.length > 0 ? 
    new Date(versions[0].timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Aucune';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de bord
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={publishing ? <CircularProgress size={20} /> : <PublishIcon />}
          onClick={handlePublish}
          disabled={publishing}
        >
          {publishing ? 'Publication en cours...' : 'Publier le site'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistiques principales */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Statistiques
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <DescriptionIcon color="primary" fontSize="large" />
                    <Typography variant="h4" component="div">
                      {siteStructure ? siteStructure.pages.length : 0}
                    </Typography>
                    <Typography color="text.secondary">Pages</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ImageIcon color="primary" fontSize="large" />
                    <Typography variant="h4" component="div">
                      {mediaFiles.length}
                    </Typography>
                    <Typography color="text.secondary">Médias</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PublishIcon color="primary" fontSize="large" />
                    <Typography variant="h4" component="div">
                      {publishedPagesCount}
                    </Typography>
                    <Typography color="text.secondary">Pages publiées</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EventNoteIcon color="primary" fontSize="large" />
                    <Typography variant="h4" component="div">
                      {versions.length}
                    </Typography>
                    <Typography color="text.secondary">Versions</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Liste des pages */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Pages
              </Typography>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={navigateToNewPage}
              >
                Nouvelle page
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {siteStructure && siteStructure.pages.length > 0 ? (
              <List>
                {siteStructure.pages.map((page) => (
                  <ListItem 
                    key={page.id}
                    sx={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
                      '&:last-child': { borderBottom: 'none' } 
                    }}
                    secondaryAction={
                      <Box>
                        <Tooltip title="Modifier">
                          <IconButton 
                            edge="end" 
                            aria-label="modifier"
                            onClick={() => navigateToPageEditor(page.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Prévisualiser">
                          <IconButton 
                            edge="end" 
                            aria-label="prévisualiser"
                            disabled={!page.isPublished}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: page.isPublished ? 'success.light' : 'action.disabled' }}>
                        <DescriptionIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={page.title}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {page.path}
                          </Typography>
                          {' — '}
                          {page.isPublished ? 'Publié' : 'Non publié'}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Aucune page trouvée
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={navigateToPages}
              >
                Voir toutes les pages
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Accès rapides */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Accès rapides
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={navigateToMedia}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ImageIcon color="primary" fontSize="large" />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Médias
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={navigateToTheme}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PaletteIcon color="primary" fontSize="large" />
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Thème
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Activité récente */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité récente
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {versions.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {versions.slice(0, 5).map((version, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
                      '&:last-child': { borderBottom: 'none' } 
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <EventNoteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={version.file.split('/').pop()}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {new Date(version.timestamp).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                          {' — '}
                          {version.user}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Aucune activité récente
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={navigateToVersions}
              >
                Voir l'historique complet
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Informations sur le site */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informations sur le site
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Dernière mise à jour
                  </Typography>
                  <Typography variant="body1">
                    {lastUpdate}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Par
                  </Typography>
                  <Typography variant="body1">
                    {user?.username || 'Utilisateur'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Thème actif
                  </Typography>
                  <Typography variant="body1">
                    Ayurveda Équilibre
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1">
                    1.0.0
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;