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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Autocomplete,
  Divider,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import FilterListIcon from '@mui/icons-material/FilterList';
import ImageIcon from '@mui/icons-material/Image';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import ScheduleIcon from '@mui/icons-material/Schedule';

// Components
import RichTextEditor from '../components/editors/RichTextEditor';
import ImageSelector from '../components/media/ImageSelector';

// Context
import { useAlert } from '../contexts/AlertContext';

// Services
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../services/api';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const TruncatedTypography = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical'
});

/**
 * Page de gestion des articles de blog
 */
const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  
  // Charger les articles de blog au chargement de la page
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const data = await getBlogPosts();
        setPosts(data);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(data.flatMap(post => post.categories || []))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Erreur lors du chargement des articles de blog:', error);
        showError('Erreur lors du chargement des articles de blog');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, [showError]);
  
  // Filtrer les articles en fonction de la recherche et de la catégorie
  useEffect(() => {
    let filtered = posts;
    
    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par catégorie
    if (filterCategory && filterCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.categories && post.categories.includes(filterCategory)
      );
    }
    
    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterCategory]);
  
  // Gestionnaires d'événements
  const handleCreatePost = () => {
    setCurrentPost({
      id: '',
      title: 'Nouvel article',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      categories: [],
      tags: [],
      author: 'Admin',
      date: new Date().toISOString(),
      status: 'draft',
      seo: {
        title: '',
        description: '',
        keywords: ''
      }
    });
    setIsEditModalOpen(true);
  };
  
  const handleEditPost = (post) => {
    setCurrentPost(post);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (post) => {
    setCurrentPost(post);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentPost) return;
    
    try {
      setSaving(true);
      await deleteBlogPost(currentPost.id);
      
      // Mettre à jour la liste des articles
      setPosts(prevPosts => prevPosts.filter(post => post.id !== currentPost.id));
      
      showSuccess('Article supprimé avec succès !');
      setIsDeleteModalOpen(false);
      setCurrentPost(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      showError('Erreur lors de la suppression de l\'article');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTogglePublish = async (post) => {
    try {
      const updatedPost = { 
        ...post, 
        status: post.status === 'published' ? 'draft' : 'published',
        publishDate: post.status === 'published' ? null : new Date().toISOString()
      };
      
      await updateBlogPost(post.id, updatedPost);
      
      // Mettre à jour la liste des articles
      setPosts(prevPosts => prevPosts.map(p => 
        p.id === post.id ? updatedPost : p
      ));
      
      showSuccess(`Article ${updatedPost.status === 'published' ? 'publié' : 'dépublié'} avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'article:', error);
      showError('Erreur lors de la mise à jour du statut de l\'article');
    }
  };
  
  const handleSavePost = async () => {
    if (!currentPost) return;
    
    try {
      setSaving(true);
      
      // Générer un slug à partir du titre s'il n'existe pas
      if (!currentPost.slug) {
        currentPost.slug = currentPost.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      if (currentPost.id) {
        // Mise à jour d'un article existant
        await updateBlogPost(currentPost.id, currentPost);
        
        // Mettre à jour la liste des articles
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === currentPost.id ? currentPost : post
        ));
        
        showSuccess('Article mis à jour avec succès !');
      } else {
        // Création d'un nouvel article
        const result = await createBlogPost(currentPost);
        
        // Ajouter le nouvel article à la liste
        setPosts(prevPosts => [...prevPosts, { ...currentPost, id: result.id }]);
        
        showSuccess('Article créé avec succès !');
      }
      
      setIsEditModalOpen(false);
      setCurrentPost(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'article:', error);
      showError('Erreur lors de l\'enregistrement de l\'article');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSelectImage = (imageUrl) => {
    setCurrentPost({
      ...currentPost,
      featuredImage: imageUrl
    });
    setImageDialogOpen(false);
  };
  
  const handlePostValueChange = (field, value) => {
    setCurrentPost({
      ...currentPost,
      [field]: value
    });
  };
  
  const handleSeoChange = (field, value) => {
    setCurrentPost({
      ...currentPost,
      seo: {
        ...currentPost.seo,
        [field]: value
      }
    });
  };
  
  // Rendu du statut de l'article sous forme de badge
  const renderStatus = (status) => {
    switch (status) {
      case 'published':
        return <Chip label="Publié" color="success" size="small" />;
      case 'draft':
        return <Chip label="Brouillon" color="default" size="small" />;
      case 'scheduled':
        return <Chip label="Programmé" color="primary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Rendu de la vue en grille
  const renderGridView = () => {
    return (
      <Grid container spacing={3}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <StyledCard>
                <CardMedia
                  component="img"
                  height="160"
                  image={post.featuredImage || 'https://via.placeholder.com/400x200?text=Blog+Article'}
                  alt={post.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom component="div">
                    {post.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {post.author}
                    </Typography>
                    <TodayIcon fontSize="small" color="action" sx={{ ml: 2, mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <TruncatedTypography variant="body2" color="text.secondary">
                    {post.excerpt || 'Aucun extrait disponible'}
                  </TruncatedTypography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {post.categories && post.categories.map(category => (
                      <Chip 
                        key={category} 
                        label={category} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <Box sx={{ p: 1, bgcolor: 'background.default' }}>
                  {renderStatus(post.status)}
                </Box>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditPost(post)}>
                    Modifier
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={post.status === 'published' ? <UnpublishedIcon /> : <PublishIcon />}
                    onClick={() => handleTogglePublish(post)}
                  >
                    {post.status === 'published' ? 'Dépublier' : 'Publier'}
                  </Button>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(post)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </StyledCard>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Aucun article trouvé
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreatePost}
              >
                Créer un nouvel article
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };
  
  // Rendu de la vue en tableau
  const renderTableView = () => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="table des articles">
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Auteur</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Catégories</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {post.categories && post.categories.map(category => (
                        <Chip 
                          key={category} 
                          label={category} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{renderStatus(post.status)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton onClick={() => handleEditPost(post)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={post.status === 'published' ? 'Dépublier' : 'Publier'}>
                      <IconButton 
                        color={post.status === 'published' ? 'success' : 'default'}
                        onClick={() => handleTogglePublish(post)}
                      >
                        {post.status === 'published' ? <UnpublishedIcon /> : <PublishIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteClick(post)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 5 }}>
                    Aucun article trouvé
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleCreatePost}
                    sx={{ mt: 1 }}
                  >
                    Créer un nouvel article
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion du blog
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreatePost}
        >
          Nouvel article
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              placeholder="Rechercher un article..."
              variant="outlined"
              size="small"
              fullWidth
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Catégorie</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Catégorie"
                startAdornment={<CategoryIcon sx={{ mr: 1, ml: -0.5 }} />}
              >
                <MenuItem value="all">Toutes les catégories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              aria-label="vue des articles"
            >
              <Tab label="Grille" value="grid" />
              <Tab label="Tableau" value="table" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderTableView()
      )}
      
      {/* Dialogue d'édition d'article */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {currentPost?.id ? 'Modifier l\'article' : 'Nouvel article'}
        </DialogTitle>
        <DialogContent dividers>
          {currentPost && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Titre de l'article"
                  value={currentPost.title}
                  onChange={(e) => handlePostValueChange('title', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Slug (URL)"
                  value={currentPost.slug}
                  onChange={(e) => handlePostValueChange('slug', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  placeholder="mon-article-de-blog"
                  helperText="Laissez vide pour générer automatiquement à partir du titre"
                />
                
                <TextField
                  fullWidth
                  label="Extrait"
                  value={currentPost.excerpt}
                  onChange={(e) => handlePostValueChange('excerpt', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Un court résumé de l'article qui apparaîtra dans les listes et dans les résultats de recherche"
                />
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Contenu de l'article
                </Typography>
                <RichTextEditor
                  value={currentPost.content}
                  onChange={(content) => handlePostValueChange('content', content)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Paramètres de publication
                  </Typography>
                  
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={currentPost.status}
                      onChange={(e) => handlePostValueChange('status', e.target.value)}
                      label="Statut"
                    >
                      <MenuItem value="draft">Brouillon</MenuItem>
                      <MenuItem value="published">Publié</MenuItem>
                      <MenuItem value="scheduled">Programmé</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Auteur"
                    value={currentPost.author}
                    onChange={(e) => handlePostValueChange('author', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    size="small"
                  />
                  
                  <TextField
                    fullWidth
                    label="Date"
                    value={currentPost.date ? new Date(currentPost.date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handlePostValueChange('date', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    size="small"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                  />
                </Paper>
                
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Image à la une
                  </Typography>
                  
                  {currentPost.featuredImage ? (
                    <Box sx={{ mb: 2, position: 'relative' }}>
                      <img 
                        src={currentPost.featuredImage} 
                        alt="Featured" 
                        style={{ width: '100%', borderRadius: '4px' }} 
                      />
                      <IconButton
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
                        onClick={() => handlePostValueChange('featuredImage', '')}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 120, 
                        bgcolor: 'background.default', 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      <ImageIcon color="action" fontSize="large" />
                    </Box>
                  )}
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ImageIcon />}
                    onClick={() => setImageDialogOpen(true)}
                  >
                    Choisir une image
                  </Button>
                </Paper>
                
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Catégories et tags
                  </Typography>
                  
                  <Autocomplete
                    multiple
                    id="categories"
                    options={categories}
                    value={currentPost.categories || []}
                    onChange={(e, newValue) => handlePostValueChange('categories', newValue)}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Catégories"
                        placeholder="Ajouter une catégorie"
                        margin="normal"
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                  
                  <Autocomplete
                    multiple
                    id="tags"
                    options={[]}
                    value={currentPost.tags || []}
                    onChange={(e, newValue) => handlePostValueChange('tags', newValue)}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Tags"
                        placeholder="Ajouter un tag"
                        margin="normal"
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    SEO
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Titre SEO"
                    value={currentPost.seo?.title || ''}
                    onChange={(e) => handleSeoChange('title', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    size="small"
                    placeholder="Titre optimisé pour les moteurs de recherche"
                  />
                  
                  <TextField
                    fullWidth
                    label="Description SEO"
                    value={currentPost.seo?.description || ''}
                    onChange={(e) => handleSeoChange('description', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Description pour les moteurs de recherche"
                  />
                  
                  <TextField
                    fullWidth
                    label="Mots-clés SEO"
                    value={currentPost.seo?.keywords || ''}
                    onChange={(e) => handleSeoChange('keywords', e.target.value)}
                    variant="outlined"
                    margin="normal"
                    size="small"
                    placeholder="mot-clé1, mot-clé2, mot-clé3"
                    helperText="Séparez les mots-clés par des virgules"
                  />
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsEditModalOpen(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSavePost}
            disabled={saving || !currentPost?.title}
          >
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <DialogTitle>Supprimer l'article</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'article "{currentPost?.title}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Suppression...' : 'Supprimer'}
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

export default BlogManagement;