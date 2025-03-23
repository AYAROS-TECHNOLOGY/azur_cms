import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pages: 0,
    media: 0,
    deployments: 0
  });
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Cette route devrait être implémentée dans votre API
        const response = await axios.get('/dashboard');
        
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentPages(response.data.recentPages);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };

    // Simuler un chargement de données
    setTimeout(() => {
      // Données simulées pour la démo
      setStats({
        pages: 5,
        media: 12,
        deployments: 3
      });
      
      setRecentPages([
        { _id: '1', title: 'Accueil', slug: 'home', isPublished: true, updatedAt: new Date().toISOString(), views: 253 },
        { _id: '2', title: 'À propos', slug: 'about', isPublished: true, updatedAt: new Date(Date.now() - 86400000).toISOString(), views: 124 },
        { _id: '3', title: 'Contact', slug: 'contact', isPublished: false, updatedAt: new Date(Date.now() - 172800000).toISOString(), views: 56 },
        { _id: '4', title: 'Services', slug: 'services', isPublished: true, updatedAt: new Date().toISOString(), views: 78 },
        { _id: '5', title: 'Blog', slug: 'blog', isPublished: true, updatedAt: new Date().toISOString(), views: 189 }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrer les pages en fonction de la recherche et du filtre actif
  const filteredPages = recentPages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'published') return matchesSearch && page.isPublished;
    if (activeFilter === 'drafts') return matchesSearch && !page.isPublished;
    
    return matchesSearch;
  });

  // Format date relative
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return "Aujourd'hui";
    if (diffInHours < 48) return "Hier";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* En-tête avec recherche */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
            Tableau de bord
          </h1>
          <p style={{ color: '#4b5563' }}>
            Bienvenue, {user?.name || 'Utilisateur'} | {new Date().toLocaleDateString()}
          </p>
        </div>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Rechercher une page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              width: '250px'
            }}
          />
          <button 
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: searchTerm ? '#4b5563' : '#9ca3af'
            }}
          >
            {searchTerm ? 'x' : '🔍'}
          </button>
        </div>
      </div>

      {/* Message de bienvenue */}
      <div style={{ 
        backgroundColor: '#e0f2fe', 
        borderLeft: '4px solid #3b82f6',
        padding: '15px',
        marginBottom: '24px',
        borderRadius: '6px'
      }}>
        <p style={{ color: '#1e40af' }}>
          Bienvenue sur votre tableau de bord ! Vous pouvez gérer votre contenu et analyser les performances de votre site.
        </p>
      </div>

      {/* Statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#dbeafe', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#2563eb',
              marginRight: '15px'
            }}>
              <span style={{ fontSize: '18px' }}>📄</span>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Pages</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.pages}</div>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#dcfce7', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#16a34a',
              marginRight: '15px'
            }}>
              <span style={{ fontSize: '18px' }}>🖼️</span>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Médias</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.media}</div>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#f3e8ff', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#9333ea',
              marginRight: '15px'
            }}>
              <span style={{ fontSize: '18px' }}>🚀</span>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Déploiements</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{stats.deployments}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>
          Actions rapides
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px' 
        }}>
          <Link 
            to="/pages/new" 
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '10px 15px', 
              borderRadius: '6px', 
              textAlign: 'center', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Nouvelle page
          </Link>
          <Link 
            to="/media" 
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '10px 15px', 
              borderRadius: '6px', 
              textAlign: 'center', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Gérer les médias
          </Link>
          <Link 
            to="/themes" 
            style={{ 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              padding: '10px 15px', 
              borderRadius: '6px', 
              textAlign: 'center', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Modifier le thème
          </Link>
          <Link 
            to="/deploy" 
            style={{ 
              backgroundColor: '#8b5cf6', 
              color: 'white', 
              padding: '10px 15px', 
              borderRadius: '6px', 
              textAlign: 'center', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Déployer le site
          </Link>
        </div>
      </div>

      {/* Pages récentes */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          padding: '15px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            Pages récentes
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveFilter('all')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'all' ? '#dbeafe' : '#f3f4f6',
                color: activeFilter === 'all' ? '#1d4ed8' : '#4b5563',
                fontWeight: activeFilter === 'all' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Toutes
            </button>
            <button 
              onClick={() => setActiveFilter('published')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'published' ? '#dcfce7' : '#f3f4f6',
                color: activeFilter === 'published' ? '#15803d' : '#4b5563',
                fontWeight: activeFilter === 'published' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Publiées
            </button>
            <button 
              onClick={() => setActiveFilter('drafts')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'drafts' ? '#fef3c7' : '#f3f4f6',
                color: activeFilter === 'drafts' ? '#92400e' : '#4b5563',
                fontWeight: activeFilter === 'drafts' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Brouillons
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderRadius: '50%',
              borderTop: '4px solid #3b82f6',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
            <p style={{ color: '#6b7280', marginTop: '15px' }}>Chargement des données...</p>
          </div>
        ) : filteredPages.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Titre
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    URL
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Statut
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vues
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Modifié
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, index) => (
                  <tr 
                    key={page._id} 
                    style={{ 
                      borderTop: '1px solid #e5e7eb',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <Link 
                        to={`/pages/${page._id}`} 
                        style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}
                      >
                        {page.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#4b5563' }}>
                      /{page.slug}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: page.isPublished ? '#dcfce7' : '#fef3c7',
                        color: page.isPublished ? '#15803d' : '#92400e'
                      }}>
                        {page.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#4b5563' }}>
                      {page.views} vues
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#4b5563' }}>
                      {getRelativeTime(page.updatedAt)}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <Link 
                          to={`/pages/${page._id}`} 
                          style={{ color: '#2563eb', textDecoration: 'none' }}
                        >
                          Modifier
                        </Link>
                        <button
                          style={{ 
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '0'
                          }}
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📄</div>
            <h3 style={{ color: '#111827', fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
              Aucune page trouvée
            </h3>
            <p style={{ color: '#6b7280' }}>
              {searchTerm 
                ? `Aucun résultat pour "${searchTerm}"`
                : "Vous n'avez pas encore créé de pages"}
            </p>
            <Link 
              to="/pages/new" 
              style={{ 
                display: 'inline-block',
                marginTop: '15px',
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Créer une page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;