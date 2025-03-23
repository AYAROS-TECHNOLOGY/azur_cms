'use strict';

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const router = express.Router();

// Chemin vers le template statique et fichier de stockage des blocs édités
const TEMPLATE_FILE = path.join(__dirname, '..', '..', 'site', 'index.html');

const BLOCKS_FILE = path.join(__dirname, '..', 'data', 'templateBlocks.json');

// Charge le fichier template
async function loadTemplate() {
  if (!(await fs.pathExists(TEMPLATE_FILE))) {
    throw new Error("Fichier template introuvable");
  }
  return fs.readFile(TEMPLATE_FILE, 'utf8');
}

// Charge ou initialise le fichier des blocs éditables
async function loadBlocks() {
  if (!(await fs.pathExists(BLOCKS_FILE))) {
    await fs.writeJson(BLOCKS_FILE, {});
  }
  return fs.readJson(BLOCKS_FILE);
}

// Sauvegarde les blocs édités
async function saveBlocks(blocks) {
  return fs.writeJson(BLOCKS_FILE, blocks, { spaces: 2 });
}


router.get('/blocks', async (req, res) => {
  try {
    const templateHTML = await loadTemplate();
    const storedBlocks = await loadBlocks();
    const $ = cheerio.load(templateHTML);
    const blocks = {};
    // Les blocs éditables sont marqués par data-editable="true" et data-block="id"
    $('[data-editable="true"]').each((i, elem) => {
      const blockId = $(elem).attr('data-block');
      // Si un contenu a déjà été sauvegardé, on l’utilise, sinon le contenu actuel du template
      blocks[blockId] = storedBlocks[blockId] || $(elem).html();
    });
    res.json(blocks);
  } catch (error) {
    console.error('Erreur lors du chargement des blocs du template:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des blocs du template' });
  }
});


router.post('/blocks/:blockId', async (req, res) => {
  try {
    const { blockId } = req.params;
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Contenu invalide' });
    }
    const blocks = await loadBlocks();
    blocks[blockId] = content;
    await saveBlocks(blocks);
    res.json({ message: `Bloc ${blockId} mis à jour avec succès` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bloc:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du bloc' });
  }
});


router.get('/render', async (req, res) => {
  try {
    let templateHTML = await loadTemplate();
    const blocks = await loadBlocks();
    const $ = cheerio.load(templateHTML);
    $('[data-editable="true"]').each((i, elem) => {
      const blockId = $(elem).attr('data-block');
      if (blocks[blockId]) {
        $(elem).html(blocks[blockId]);
      }
    });
    res.send($.html());
  } catch (error) {
    console.error('Erreur lors du rendu du template:', error);
    res.status(500).json({ error: 'Erreur lors du rendu du template' });
  }
});

module.exports = router;
