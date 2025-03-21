import React, { useState, useEffect } from 'react';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styles personnalisés
const EditorWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& .rdw-editor-toolbar': {
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`
  },
  '& .rdw-editor-main': {
    minHeight: '200px',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper
  },
  '& .rdw-option-wrapper': {
    borderRadius: theme.shape.borderRadius,
    padding: '5px'
  },
  '& .rdw-option-active': {
    backgroundColor: theme.palette.primary.light,
    borderRadius: theme.shape.borderRadius
  }
}));

const RichTextEditor = ({ value, onChange, label, placeholder }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [initialized, setInitialized] = useState(false);

  // Initialiser l'éditeur avec la valeur fournie
  useEffect(() => {
    if (!initialized && value) {
      const contentBlock = htmlToDraft(value);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        setEditorState(editorState);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Mettre à jour l'état de l'éditeur et remonter les changements
  const handleEditorChange = (state) => {
    setEditorState(state);
    if (onChange) {
      const htmlContent = draftToHtml(convertToRaw(state.getCurrentContent()));
      onChange(htmlContent);
    }
  };

  // Options de la barre d'outils
  const toolbarOptions = {
    options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough'],
    },
    blockType: {
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
    textAlign: {
      options: ['left', 'center', 'right', 'justify'],
    },
  };

  return (
    <Box>
      {label && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{ ml: 1 }}
        >
          {label}
        </Typography>
      )}
      <EditorWrapper elevation={0}>
        <Editor
          editorState={editorState}
          wrapperClassName="rich-text-wrapper"
          editorClassName="rich-text-editor"
          onEditorStateChange={handleEditorChange}
          toolbar={toolbarOptions}
          placeholder={placeholder || "Écrivez votre contenu ici..."}
          localization={{
            locale: 'fr',
          }}
        />
      </EditorWrapper>
    </Box>
  );
};

export default RichTextEditor;