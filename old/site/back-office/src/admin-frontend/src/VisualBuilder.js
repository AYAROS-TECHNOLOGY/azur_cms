import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * VisualBuilder : éditeur visuel pour TOUT le template
 */
function VisualBuilder() {
  const [templateHtml, setTemplateHtml] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchElements();
  }, []);

  const fetchElements = async () => {
    try {
      const res = await axios.get('/api/builder/elements');
      setTemplateHtml(res.data.template);   // HTML complet
      setElements(res.data.elements);       // Liste des éléments
    } catch (error) {
      console.error('Erreur fetchElements:', error);
    }
  };

  const handleSelect = (elementId) => {
    const elem = elements.find(e => e.id === elementId);
    setSelectedElement({ ...elem }); // On clone l'élément
  };

  const handleChange = (field, value) => {
    if (!selectedElement) return;
    setSelectedElement(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedElement) return;
    const { id, html, style, className } = selectedElement;
    try {
      await axios.post(`/api/builder/elements/${id}`, {
        html, style, className
      });
      // Mettre à jour localement la liste
      setElements(prev => prev.map(e => (e.id === id ? selectedElement : e)));
      alert(`Bloc ${id} sauvegardé`);
    } catch (error) {
      console.error('Erreur save element:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handlePreview = () => {
    // Ouvre l'URL /api/builder/preview
    window.open('/api/builder/preview', '_blank');
  };

  // Permet de recharger l’iframe après modifications
  const reloadIframe = () => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(templateHtml);
        iframeDoc.close();
      }
    }
  };

  useEffect(() => {
    // Chaque fois que templateHtml change, on recharge l'iframe
    if (templateHtml) {
      reloadIframe();
    }
  }, [templateHtml]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Barre latérale gauche : liste des éléments */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <h3>Composants</h3>
        {elements.map(el => (
          <div key={el.id} style={{ padding: '0.5rem', cursor: 'pointer', background: (selectedElement && selectedElement.id === el.id) ? '#ddd' : 'transparent' }}
               onClick={() => handleSelect(el.id)}>
            <strong>{el.component}</strong> <br />
            <small>ID: {el.id}</small>
          </div>
        ))}
      </div>

      {/* Zone centrale : iFrame Preview */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe ref={iframeRef} style={{ width: '100%', height: '100%' }} title="Preview"></iframe>
        <button onClick={handlePreview} style={{ position: 'absolute', top: 10, right: 10, background: '#126058', color: '#fff', padding: '0.5rem 1rem' }}>
          Aperçu complet
        </button>
      </div>

      {/* Barre latérale droite : Propriétés de l’élément sélectionné */}
      <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
        {selectedElement ? (
          <>
            <h3>Propriétés</h3>
            <p>ID : {selectedElement.id}</p>
            <p>Type : {selectedElement.component}</p>

            <label>Contenu HTML :</label>
            <ReactQuill
              theme="snow"
              value={selectedElement.html}
              onChange={(val) => handleChange('html', val)}
              style={{ height: '200px', marginBottom: '1rem' }}
            />

            <label>Style (inline CSS) :</label>
            <textarea
              value={selectedElement.style}
              onChange={e => handleChange('style', e.target.value)}
              style={{ width: '100%', height: '80px', marginBottom: '1rem' }}
            />

            <label>Classes :</label>
            <input
              type="text"
              value={selectedElement.className}
              onChange={e => handleChange('className', e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            />

            <button onClick={handleSave} style={{ background: '#d4a039', color: '#fff', padding: '0.5rem 1rem' }}>
              Enregistrer
            </button>
          </>
        ) : (
          <p>Sélectionnez un élément pour l'éditer.</p>
        )}
      </div>
    </div>
  );
}

export default VisualBuilder;
