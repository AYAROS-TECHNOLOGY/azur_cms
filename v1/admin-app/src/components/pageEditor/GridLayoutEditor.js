import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const GridLayoutEditor = ({ blocks, onLayoutChange, onBlockSelect, selectedBlockId }) => {
  // Convertir les blocs en layout pour react-grid-layout
  const [layouts, setLayouts] = useState({
    lg: blocks.map(block => ({
      i: block.id.toString(),
      x: block.position?.x || 0,
      y: block.position?.y || 0,
      w: block.position?.width || 12,
      h: block.position?.height || 2,
      minW: 1,
      maxW: 12
    }))
  });

  // Mettre à jour les layouts lorsque les blocs changent
  useEffect(() => {
    setLayouts({
      lg: blocks.map(block => ({
        i: block.id.toString(),
        x: block.position?.x || 0,
        y: block.position?.y || 0,
        w: block.position?.width || 12,
        h: block.position?.height || 2,
        minW: 1,
        maxW: 12
      }))
    });
  }, [blocks]);

  // Gérer le changement de layout
  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Mettre à jour les layouts locaux
    setLayouts(allLayouts);

    // Convertir le layout en format de position pour les blocs
    const blockPositions = currentLayout.map(item => ({
      id: item.i,
      position: {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      }
    }));

    // Envoyer les positions mises à jour au composant parent
    if (onLayoutChange) {
      onLayoutChange(blockPositions);
    }
  };

  // Rendu des blocs dans la grille
  const renderBlocks = () => {
    return blocks.map(block => (
      <div 
        key={block.id} 
        className={`block-container ${block.type}-block ${selectedBlockId === block.id ? 'selected' : ''}`}
        onClick={() => onBlockSelect && onBlockSelect(block.id)}
      >
        <div className="block-header">
          <span className="block-type">{block.type}</span>
          <span className="block-name">{block.name}</span>
        </div>
        <div className="block-content">
          {block.type === 'text' && (
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          )}
          {block.type === 'image' && (
            <img src={block.content.src} alt={block.content.alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
          )}
          {block.type === 'video' && (
            <div className="video-placeholder">
              <i className="fas fa-play-circle"></i>
              <span>{block.name}</span>
            </div>
          )}
        </div>
      </div>
    ));
  };

  // Options de la grille
  const gridOptions = {
    className: "layout",
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 40,
    margin: [10, 10],
    containerPadding: [0, 0],
    draggableHandle: ".block-header",
    isDraggable: true,
    isResizable: true,
    useCSSTransforms: true,
    compactType: null,
    preventCollision: false,
  };

  return (
    <div className="grid-layout-editor">
      <ResponsiveGridLayout
        {...gridOptions}
        layouts={layouts}
        onLayoutChange={(layout, layouts) => handleLayoutChange(layout, layouts)}
      >
        {renderBlocks()}
      </ResponsiveGridLayout>
    </div>
  );
};

export default GridLayoutEditor;ss