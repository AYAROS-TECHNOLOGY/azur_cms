'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

// Fichiers cibles
const TEMPLATE_FILE = path.join(__dirname, '..', '..', 'site', 'template.html');
const ELEMENTS_FILE = path.join(__dirname, '..', 'data', 'builderElements.json');


// Lecture ou initialisation du stockage JSON
async function loadElements() {
  if (!(await fs.pathExists(ELEMENTS_FILE))) {
    await fs.writeJson(ELEMENTS_FILE, {});
  }
  return fs.readJson(ELEMENTS_FILE);
}
async function saveElements(data) {
  await fs.writeJson(ELEMENTS_FILE, data, { spaces: 2 });
}

// Analyse initiale du template (si besoin, on peut le faire à chaque fois ou le mettre en cache)
async function parseTemplate() {
  if (!(await fs.pathExists(TEMPLATE_FILE))) {
    throw new Error('template.html introuvable');
  }
  const html = await fs.readFile(TEMPLATE_FILE, 'utf8');
  const $ = cheerio.load(html);

  // On va collecter tous les éléments ayant data-component ou data-editable
  // On stocke un ID unique par élément (ex. data-id).
  const elements = [];
  $('[data-component], [data-editable="true"]').each((index, el) => {
    const $el = $(el);
    const elId = $el.attr('data-id') || `component-${Date.now()}-${index}`;
    $el.attr('data-id', elId);

    const compType = $el.attr('data-component') || 'generic';
    // On stocke toutes les infos qu’on souhaite exposer
    const contentHtml = $el.html();
    const inlineStyle = $el.attr('style') || '';
    const classes = $el.attr('class') || '';

    elements.push({
      id: elId,
      component: compType,
      html: contentHtml,
      style: inlineStyle,
      className: classes
      // On pourrait stocker d’autres props : data-animation, data-image, etc.
    });
  });

  // On retourne le code HTML (avec data-id injecté) et la liste d’éléments
  return {
    rawHtml: $.html(),
    elements
  };
}


router.get('/elements', async (req, res) => {
  try {
    const { rawHtml, elements } = await parseTemplate();
    // Charger l’état actuel (si on a déjà modifié des éléments)
    const savedState = await loadElements();

    // Fusion : on applique le savedState pour chaque ID
    // (Ex. la version "live" du HTML, style, etc.)
    const finalElements = elements.map(el => {
      if (savedState[el.id]) {
        return {
          ...el,
          ...savedState[el.id]  // Merge
        };
      }
      return el;
    });

    res.json({
      template: rawHtml,   // Le HTML complet annoté
      elements: finalElements
    });
  } catch (error) {
    console.error('Erreur GET /api/builder/elements:', error);
    res.status(500).json({ error: 'Erreur lors de l’analyse du template' });
  }
});


router.post('/elements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { html, style, className } = req.body;
    const savedState = await loadElements();

    // On met à jour les propriétés
    savedState[id] = {
      html: html || '',
      style: style || '',
      className: className || ''
      // On peut stocker d’autres propriétés...
    };

    await saveElements(savedState);
    res.json({ message: `Élément ${id} mis à jour` });
  } catch (error) {
    console.error('Erreur POST /api/builder/elements:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l’élément' });
  }
});


router.get('/preview', async (req, res) => {
  try {
    if (!(await fs.pathExists(TEMPLATE_FILE))) {
      return res.status(404).send('Fichier template introuvable.');
    }
    const html = await fs.readFile(TEMPLATE_FILE, 'utf8');
    const savedState = await loadElements();
    const $ = cheerio.load(html);

    // Pour chaque data-id trouvé dans le template, on injecte le HTML, style, etc. depuis savedState
    $('[data-id]').each((index, el) => {
      const $el = $(el);
      const elId = $el.attr('data-id');
      if (savedState[elId]) {
        const { html: blockHtml, style, className } = savedState[elId];
        $el.html(blockHtml);
        if (style) $el.attr('style', style);
        else $el.removeAttr('style');
        if (className) $el.attr('class', className);
        else $el.removeAttr('class');
      }
    });

    res.type('html').send($.html());
  } catch (error) {
    console.error('Erreur GET /api/builder/preview:', error);
    res.status(500).send('Erreur lors du rendu du template');
  }
});

module.exports = router;
