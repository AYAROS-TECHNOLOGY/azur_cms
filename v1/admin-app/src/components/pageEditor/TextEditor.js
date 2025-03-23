import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

const TextEditor = ({ initialContent, onChange }) => {
  // Initialiser l'état de l'éditeur
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        // Tenter de convertir du JSON si c'est un objet ContentState
        if (typeof initialContent === 'object') {
          return EditorState.createWithContent(convertFromRaw(initialContent));
        }
        // Sinon, traiter comme du HTML simple
        return EditorState.createWithContent(ContentState.createFromText(initialContent));
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'éditeur:', error);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  // Mettre à jour le contenu parent lorsque l'état de l'éditeur change
  useEffect(() => {
    if (onChange) {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      onChange(rawContent);
    }
  }, [editorState, onChange]);

  // Gérer les changements d'état de l'éditeur
  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  // Gérer les raccourcis clavier
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Appliquer un style de formatage
  const applyStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Appliquer un bloc de formatage
  const applyBlock = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  return (
    <div className="text-editor">
      <div className="toolbar">
        <div className="button-group">
          <button 
            onClick={() => applyStyle('BOLD')}
            className="toolbar-button"
            title="Gras (Ctrl+B)"
          >
            <i className="fas fa-bold"></i>
          </button>
          <button 
            onClick={() => applyStyle('ITALIC')}
            className="toolbar-button"
            title="Italique (Ctrl+I)"
          >
            <i className="fas fa-italic"></i>
          </button>
          <button 
            onClick={() => applyStyle('UNDERLINE')}
            className="toolbar-button"
            title="Souligné (Ctrl+U)"
          >
            <i className="fas fa-underline"></i>
          </button>
          <button 
            onClick={() => applyStyle('STRIKETHROUGH')}
            className="toolbar-button"
            title="Barré"
          >
            <i className="fas fa-strikethrough"></i>
          </button>
        </div>

        <div className="button-group">
          <button 
            onClick={() => applyBlock('header-one')}
            className="toolbar-button"
            title="Titre 1"
          >
            <i className="fas fa-heading"></i>1
          </button>
          <button 
            onClick={() => applyBlock('header-two')}
            className="toolbar-button"
            title="Titre 2"
          >
            <i className="fas fa-heading"></i>2
          </button>
          <button 
            onClick={() => applyBlock('header-three')}
            className="toolbar-button"
            title="Titre 3"
          >
            <i className="fas fa-heading"></i>3
          </button>
        </div>

        <div className="button-group">
          <button 
            onClick={() => applyBlock('unordered-list-item')}
            className="toolbar-button"
            title="Liste à puces"
          >
            <i className="fas fa-list-ul"></i>
          </button>
          <button 
            onClick={() => applyBlock('ordered-list-item')}
            className="toolbar-button"
            title="Liste numérotée"
          >
            <i className="fas fa-list-ol"></i>
          </button>
          <button 
            onClick={() => applyBlock('blockquote')}
            className="toolbar-button"
            title="Citation"
          >
            <i className="fas fa-quote-right"></i>
          </button>
          <button 
            onClick={() => applyBlock('code-block')}
            className="toolbar-button"
            title="Bloc de code"
          >
            <i className="fas fa-code"></i>
          </button>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="Commencez à écrire..."
          spellCheck={true}
        />
      </div>
    </div>
  );
};

export default TextEditor;