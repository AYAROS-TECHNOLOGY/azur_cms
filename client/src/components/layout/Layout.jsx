import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PublishIcon from '@mui/icons-material/Publish';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Contexts
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

// Services
import { publishSite } from '../../services/api';

// Constants
const DRAWER_WIDTH = 240;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${DRAWER_WIDTH}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      marginLeft: `${DRAWER_WIDTH}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'center',
}));

const Layout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useAlert();

  // Menu handlers
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  // Drawer handlers
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Publication handlers
  const handlePublishClick = () => {
    setPublishDialogOpen(true);
  };

  const handlePublishClose = () => {
    setPublishDialogOpen(false);
  };

  const handlePublishConfirm = async () => {
    try {
      setPublishing(true);
      await publishSite();
      showSuccess('Site publié avec succès !');
    } catch (error) {
      console.error('Erreur lors de la publication du site:', error);
      showError('Erreur lors de la publication du site');
    } finally {
      setPublishing(false);
      setPublishDialogOpen(false);
    }
  };

  // Navigation items
  const navItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/' },
    { text: 'Pages', icon: <DescriptionIcon />, path: '/pages' },
    { text: 'Médias', icon: <ImageIcon />, path: '/media' },
    { text: 'Thème', icon: <PaletteIcon />, path: '/theme' },
    { text: 'Versions', icon: <EventNoteIcon />, path: '/versions' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open} color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="ouvrir le tiroir"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Ayurveda Équilibre CMS
          </Typography>
          
          <Button 
            color="inherit" 
            startIcon={<PublishIcon />}
            onClick={handlePublishClick}
          >
            Publier
          </Button>
          
          <Box>
            <IconButton
              size="large"
              aria-label="compte de l'utilisateur"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.username || 'Utilisateur'}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <img src="../client/public/cms_12470051.png" alt="Logo" style={{ height: 40 }} />
            <Typography variant="h6" sx={{ ml: 1, color: 'primary.main' }}>
              Ayurveda CMS
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      <Main open={open}>
        <DrawerHeader /> {/* Spacer */}
        <Outlet /> {/* Router outlet */}
      </Main>
      
      {/* Dialogue de confirmation de publication */}
      <Dialog
        open={publishDialogOpen}
        onClose={handlePublishClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Publier le site
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Voulez-vous publier le site avec toutes les modifications actuelles ?
            Cette action génèrera une nouvelle version du site statique visible par les visiteurs.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePublishClose} disabled={publishing}>
            Annuler
          </Button>
          <Button 
            onClick={handlePublishConfirm} 
            autoFocus 
            variant="contained" 
            color="primary"
            disabled={publishing}
            startIcon={publishing ? <CircularProgress size={20} /> : null}
          >
            {publishing ? 'Publication...' : 'Publier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;