import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  Chip,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SeoIcon from '@mui/icons-material/TravelExplore';
import DescriptionIcon from '@mui/icons-material/Description';
import TitleIcon from '@mui/icons-material/Title';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Styled components
const MetadataSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

const SeoPreview = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  overflow: 'hidden',
  cursor: 'default'
}));

const GooglePreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'Arial, sans-serif'
}));

const PreviewTitle = styled(Typography)(({ theme }) => ({
  color: '#1a0dab',
  fontSize: '18px',
  fontWeight: 400,
  marginBottom: '4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline'
  }
}));

const PreviewUrl = styled(Typography)(({ theme }) => ({
  color: '#006621',
  fontSize: '14px',
  marginBottom: '4px'
}));

const PreviewDescription = styled(Typography)(({ theme }) => ({
  color: '#545454',
  fontSize: '14px',
  lineHeight: '1.4',
  display: '-webkit-box',
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}));

const SeoScoreCard = styled(Card)(({ theme, score }) => {
  let color = theme.palette.success.light;
  if (score < 50) {
    color = theme.palette.error.light;
  } else if (score < 80) {
    color = theme.palette.warning.light;
  }
  
  return {
    marginTop: theme.spacing(2),
    backgroundColor: color,
    color: theme.palette.getContrastText(color)
  };
});

/**
 * Éditeur de métadonnées et SEO pour les pages
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.pageData - Données de la page
 * @param {Function} props.onMetaChange - Fonction pour mettre à jour les métadonnées
 */
const MetadataEditor = ({ pageData, onMetaChange }) => {
  // Calculer le score SEO de manière simplifiée
  const calculateSeoScore = () => {
    let score = 0;
    
    // Titre présent et de bonne longueur (entre 30 et 60 caractères)
    if (pageData.title) {
      score += 20;
      const titleLength = pageData.title.length;
      if (titleLength >= 30 && titleLength <= 60) {
        score += 10;
      } else if (titleLength > 0) {
        score += 5;
      }
    }
    
    // Meta description présente et de bonne longueur (entre 120 et 160 caractères)
    if (pageData.meta.description) {
      score += 20;
      const descLength = pageData.meta.description.length;
      if (descLength >= 120 && descLength <= 160) {
        score += 10;
      } else if (descLength > 0) {
        score += 5;
      }
    }
    
    // Mots-clés présents
    if (pageData.meta.keywords && pageData.meta.keywords.length > 0) {
      score += 10;
      // Bon nombre de mots-clés (entre 3 et 10)
      const keywordsCount = pageData.meta.keywords.split(',').filter(k => k.trim()).length;
      if (keywordsCount >= 3 && keywordsCount <= 10) {
        score += 10;
      } else if (keywordsCount > 0) {
        score += 5;
      }
    }
    
    // Chemin d'accès descriptif
    if (pageData.path && pageData.path.includes('-')) {
      score += 10;
    }
    
    // Page publiée
    if (pageData.isPublished) {
      score += 10;
    }
    
    return score;
  };
  
  const seoScore = calculateSeoScore();
  
  // Rendu du composant
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Métadonnées et SEO
      </Typography>
      
      <MetadataSection>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TitleIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Titre et description
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Titre de la page"
              variant="outlined"
              fullWidth
              value={pageData.title || ''}
              onChange={(e) => {
                // Mettre à jour le titre via les props parent
                const newTitle = e.target.value;
                onMetaChange('title', newTitle);
              }}
              helperText={`${pageData.title ? pageData.title.length : 0}/60 caractères - Idéalement entre 30 et 60`}
              error={pageData.title && (pageData.title.length < 10 || pageData.title.length > 60)}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Le titre de la page est crucial pour le SEO et apparaît dans les résultats de recherche">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Meta description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={pageData.meta?.description || ''}
              onChange={(e) => onMetaChange('description', e.target.value)}
              helperText={`${pageData.meta?.description ? pageData.meta.description.length : 0}/160 caractères - Idéalement entre 120 et 160`}
              error={pageData.meta?.description && (pageData.meta.description.length < 50 || pageData.meta.description.length > 160)}
              InputProps={{
                endAdornment: (
                  <Tooltip title="La meta description apparaît dans les résultats de recherche et doit inciter au clic">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Mots-clés"
              variant="outlined"
              fullWidth
              value={pageData.meta?.keywords || ''}
              onChange={(e) => onMetaChange('keywords', e.target.value)}
              helperText="Séparés par des virgules - 3 à 10 mots-clés pertinents"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Les mots-clés aident à comprendre le sujet de la page, mais ont moins d'impact direct sur le classement">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
        </Grid>
        
        <SeoPreview>
          <CardHeader 
            title="Aperçu dans les résultats de recherche Google" 
            subheader="Voici comment votre page pourrait apparaître dans les résultats de recherche"
            avatar={<SeoIcon />}
          />
          <CardContent>
            <GooglePreview>
              <PreviewTitle>
                {pageData.title || 'Titre de la page'}
              </PreviewTitle>
              <PreviewUrl>
                www.ayurveda-equilibre.com{pageData.path || '/page'}
              </PreviewUrl>
              <PreviewDescription>
                {pageData.meta?.description || 'La meta description de votre page apparaîtra ici. Elle doit être concise, informative et inciter au clic tout en contenant des mots-clés pertinents.'}
              </PreviewDescription>
            </GooglePreview>
          </CardContent>
        </SeoPreview>
      </MetadataSection>
      
      <MetadataSection>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Balises et structure
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel id="custom-tags-label">Balises personnalisées</FormLabel>
              <Autocomplete
                multiple
                id="custom-tags"
                options={[]}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Ajouter une balise"
                    margin="normal"
                  />
                )}
              />
              <FormHelperText>
                Ajoutez des balises pour catégoriser cette page (fonctionnalité à venir)
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel id="related-pages-label">Pages liées</FormLabel>
              <Autocomplete
                multiple
                id="related-pages"
                options={[]}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Ajouter une page liée"
                    margin="normal"
                  />
                )}
              />
              <FormHelperText>
                Ajoutez des pages liées pour améliorer la navigation (fonctionnalité à venir)
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </MetadataSection>
      
      <SeoScoreCard score={seoScore}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {seoScore >= 80 ? (
              <CheckCircleIcon sx={{ mr: 1 }} />
            ) : seoScore >= 50 ? (
              <ErrorIcon sx={{ mr: 1 }} />
            ) : (
              <ErrorIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="h6">
              Score SEO: {seoScore}/100
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {seoScore >= 80 ? (
              'Très bien! Votre page est bien optimisée pour les moteurs de recherche.'
            ) : seoScore >= 50 ? (
              'Des améliorations sont possibles pour optimiser davantage votre page.'
            ) : (
              'Votre page a besoin d\'améliorations importantes pour être bien référencée.'
            )}
          </Typography>
        </CardContent>
      </SeoScoreCard>
    </Box>
  );
};

export default MetadataEditor;