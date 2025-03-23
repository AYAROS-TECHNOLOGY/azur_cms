import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

function TemplateEditor() {
  const [blocks, setBlocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/template/blocks`);
      setBlocks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des blocs:', error);
      setLoading(false);
    }
  };

  const handleBlockChange = (blockId, newContent) => {
    setBlocks(prev => ({
      ...prev,
      [blockId]: newContent,
    }));
  };

  const saveBlock = async (blockId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/template/blocks/${blockId}`, { content: blocks[blockId] });
      setMessage(response.data.message);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du bloc ${blockId}:`, error);
      setMessage(`Erreur lors de la sauvegarde du bloc ${blockId}`);
    }
  };

  const previewTemplate = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/template/render`);
      const previewWindow = window.open('', '_blank');
      previewWindow.document.open();
      previewWindow.document.write(response.data);
      previewWindow.document.close();
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      setMessage('Erreur lors de la prévisualisation du template');
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Éditeur de Template</h2>
      {Object.keys(blocks).length === 0 ? (
        <p>Aucun bloc éditable trouvé dans le template.</p>
      ) : (
        Object.keys(blocks).map((blockId) => (
          <div key={blockId} style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
            <h3>Bloc: {blockId}</h3>
            <ReactQuill
              theme="snow"
              value={blocks[blockId]}
              onChange={(content) => handleBlockChange(blockId, content)}
              style={{ height: '200px', marginBottom: '1rem' }}
            />
            <button onClick={() => saveBlock(blockId)} style={{ marginRight: '1rem' }}>Enregistrer le bloc</button>
          </div>
        ))
      )}
      <button onClick={previewTemplate} style={{ padding: '0.5rem 1rem' }}>Prévisualiser le template</button>
      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default TemplateEditor;
