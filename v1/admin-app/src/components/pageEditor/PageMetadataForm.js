import React, { useState, useEffect } from 'react';

const PageMetadataForm = ({ metadata, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    template: 'default',
    meta: {
      title: '',
      description: '',
      keywords: ''
    },
    isPublished: false
  });

  // Mettre à jour les données du formulaire lorsque les métadonnées changent
  useEffect(() => {
    if (metadata) {
      setFormData({
        title: metadata.title || '',
        slug: metadata.slug || '',
        description: metadata.description || '',
        template: metadata.template || 'default',
        meta: metadata.meta || {
          title: '',
          description: '',
          keywords: ''
        },
        isPublished: metadata.isPublished || false
      });
    }
  }, [metadata]);

  // Gérer les changements de champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('meta.')) {
      const metaField = name.split('.')[1];
      setFormData({
        ...formData,
        meta: {
          ...formData.meta,
          [metaField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Gérer le changement de statut de publication
  const handlePublishedChange = (e) => {
    setFormData({
      ...formData,
      isPublished: e.target.checked
    });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Générer un slug à partir du titre si le slug est vide
    let slug = formData.slug;
    if (!slug && formData.title) {
      slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
        .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
        .replace(/--+/g, '-') // Éviter les tirets multiples
        .trim();
    }
    
    // Mettre à jour les données avec le slug généré
    const updatedData = {
      ...formData,
      slug
    };
    
    // Envoyer les données au composant parent
    if (onSave) {
      onSave(updatedData);
    }
  };

  return (
    <form className="page-metadata-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>Propriétés de la page</h3>
        <div className="publish-toggle">
          <label className="switch-label">
            <span>Publication</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={formData.isPublished} 
                onChange={handlePublishedChange}
              />
              <span className="slider round"></span>
            </label>
          </label>
        </div>
      </div>

      <div className="form-section">
        <h4>Informations de base</h4>
        
        <div className="form-group">
          <label htmlFor="title">Titre de la page</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="slug">Slug (URL)</label>
          <input 
            type="text" 
            id="slug" 
            name="slug" 
            value={formData.slug}
            onChange={handleChange}
            className="form-control"
            placeholder="Généré automatiquement à partir du titre si vide"
          />
          <small className="form-text text-muted">
            Le slug détermine l'URL de la page (ex: mon-site.com/mon-slug)
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="template">Template</label>
          <select 
            id="template" 
            name="template" 
            value={formData.template}
            onChange={handleChange}
            className="form-control"
          >
            <option value="default">Par défaut</option>
            <option value="landing">Page d'atterrissage</option>
            <option value="blog">Blog</option>
            <option value="contact">Contact</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h4>Métadonnées SEO</h4>
        
        <div className="form-group">
          <label htmlFor="meta.title">Titre SEO</label>
          <input 
            type="text" 
            id="meta.title" 
            name="meta.title" 
            value={formData.meta.title}
            onChange={handleChange}
            className="form-control"
            placeholder="Laissez vide pour utiliser le titre de la page"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="meta.description">Description SEO</label>
          <textarea 
            id="meta.description" 
            name="meta.description" 
            value={formData.meta.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Laissez vide pour utiliser la description de la page"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="meta.keywords">Mots-clés</label>
          <input 
            type="text" 
            id="meta.keywords" 
            name="meta.keywords" 
            value={formData.meta.keywords}
            onChange={handleChange}
            className="form-control"
            placeholder="Mots-clés séparés par des virgules"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default PageMetadataForm;