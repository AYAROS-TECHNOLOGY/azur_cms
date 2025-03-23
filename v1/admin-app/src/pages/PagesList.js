import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour le filtrage et la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Chargement des pages
  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      try {
        // Pour la démo, utilisons des données fictives
        // Dans une application réelle, vous feriez un appel API
        setTimeout(() => {
          const demoPages = [
            { _id: '1', title: 'Accueil', slug: 'index', isPublished: true, updatedAt: '2025-03-22T15:30:00Z' },
            { _id: '2', title: 'À propos', slug: 'a-propos', isPublished: false, updatedAt: '2025-03-21T10:15:00Z' },
            { _id: '3', title: 'Services', slug: 'services', isPublished: true, updatedAt: '2025-03-20T09:45:00Z' },
            { _id: '4', title: 'Contact', slug: 'contact', isPublished: true, updatedAt: '2025-03-19T14:20:00Z' },
            { _id: '5', title: 'Blog', slug: 'blog', isPublished: true, updatedAt: '2025-03-18T16:10:00Z' },
            { _id: '6', title: 'Article 1', slug: 'article-1', isPublished: true, updatedAt: '2025-03-17T11:30:00Z' },
            { _id: '7', title: 'Article 2', slug: 'article-2', isPublished: false, updatedAt: '2025-03-16T09:20:00Z' }
          ];
          
          setPages(demoPages);
          setIsLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Erreur lors du chargement des pages');
        setIsLoading(false);
        toast.error('Erreur lors du chargement des pages');
      }
    };
    
    fetchPages();
  }, []);
  
  // Filtrer les pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && page.isPublished) ||
                         (statusFilter === 'draft' && !page.isPublished);
    
    return matchesSearch && matchesStatus;
  });
  
  // Supprimer une page
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.')) {
      try {
        // Dans une application réelle, vous feriez un appel API pour supprimer la page
        // await axios.delete(`/api/pages/${id}`);
        
        // Pour la démo, supprimons-la localement
        setPages(pages.filter(page => page._id !== id));
        toast.success('Page supprimée avec succès');
      } catch (err) {
        toast.error('Erreur lors de la suppression de la page');
      }
    }
  };
  
  // Dupliquer une page
  const handleDuplicate = async (id) => {
    try {
      // Dans une application réelle, vous feriez un appel API pour dupliquer la page
      // const res = await axios.post(`/api/pages/${id}/duplicate`);
      
      // Pour la démo, dupliquons-la localement
      const pageToDuplicate = pages.find(page => page._id === id);
      if (pageToDuplicate) {
        const duplicatedPage = {
          ...pageToDuplicate,
          _id: Date.now().toString(), // Générer un nouvel ID
          title: `${pageToDuplicate.title} (copie)`,
          slug: `${pageToDuplicate.slug}-copy`,
          isPublished: false,
          updatedAt: new Date().toISOString()
        };
        
        setPages([...pages, duplicatedPage]);
        toast.success('Page dupliquée avec succès');
      }
    } catch (err) {
      toast.error('Erreur lors de la duplication de la page');
    }
  };
  
  // Publier/dépublier une page
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      // Dans une application réelle, vous feriez un appel API pour changer le statut
      // await axios.put(`/api/pages/${id}/publish`, { isPublished: !currentStatus });
      
      // Pour la démo, changeons le statut localement
      setPages(pages.map(page => 
        page._id === id ? { ...page, isPublished: !currentStatus } : page
      ));
      
      toast.success(`Page ${!currentStatus ? 'publiée' : 'dépubliée'} avec succès`);
    } catch (err) {
      toast.error(`Erreur lors de la ${!currentStatus ? 'publication' : 'dépublication'} de la page`);
    }
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-blue-500 text-3xl mb-4">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p className="text-gray-600">Chargement des pages...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pages</h1>
        <Link 
          to="/pages/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          <i className="fas fa-plus mr-2"></i>
          Nouvelle page
        </Link>
      </div>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher une page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiées</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des pages */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucune page trouvée. <Link to="/pages/new" className="text-blue-500 hover:underline">Créer une nouvelle page</Link>.
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière modification
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/pages/${page._id}`} className="text-blue-500 hover:underline font-medium">
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /{page.slug === 'index' ? '' : page.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      page.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(page.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleTogglePublish(page._id, page.isPublished)}
                      className={`text-sm mr-2 ${page.isPublished ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`}
                      title={page.isPublished ? 'Dépublier' : 'Publier'}
                    >
                      <i className={`fas fa-${page.isPublished ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                    <button
                      onClick={() => handleDuplicate(page._id)}
                      className="text-blue-500 hover:text-blue-600 mr-2"
                      title="Dupliquer"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <Link
                      to={`/pages/${page._id}`}
                      className="text-green-500 hover:text-green-600 mr-2"
                      title="Modifier"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="text-red-500 hover:text-red-600"
                      title="Supprimer"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PagesList;