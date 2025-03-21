// client/src/pages/MediaManager.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

// Components
import MediaManagerComponent from '../components/media/MediaManager';

/**
 * Page d'accès au gestionnaire de médias
 */
const MediaManagerPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestionnaire de médias
      </Typography>
      
      <MediaManagerComponent standalone={true} />
    </Box>
  );
};

export default MediaManagerPage;