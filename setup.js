const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const { spawn } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

// Chemins
const TEMPLATES_DIR = path.join(__dirname, 'src', 'templates');
const SERVER_DATA_DIR = path.join(__dirname, 'server', 'data');
const ORIGINAL_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'original-template.html');

/**
 * Fonction principale d'initialisation
 */
async function initialize() {
  console.log(chalk.green('=== Initialisation du CMS Ayurveda Équilibre ==='));
  
  try {
    // Vérifier si les répertoires nécessaires existent
    await checkDirectories();
    
    // Vérifier si le template HTML existe
    if (!await fs.pathExists(ORIGINAL_TEMPLATE_PATH)) {
      await promptForTemplate();
    } else {
      console.log(chalk.green('✓ Template HTML trouvé:', ORIGINAL_TEMPLATE_PATH));
    }
    
    // Initialiser les données du CMS
    await initializeData();
    
    // Installer les dépendances
    await installDependencies();
    
    console.log(chalk.green('\n=== Initialisation terminée avec succès ==='));
    console.log(chalk.cyan('\nPour démarrer le CMS:'));
    console.log(chalk.white('  npm start'));
    
    console.log(chalk.cyan('\nPour accéder au back-office:'));
    console.log(chalk.white('  http://localhost:3000'));
    console.log(chalk.white('  Utilisateur: kronos'));
    console.log(chalk.white('  Mot de passe: alpha123'));
    
  } catch (error) {
    console.error(chalk.red('Erreur lors de l\'initialisation:'), error);
    process.exit(1);
  }
}

/**
 * Vérifie si les répertoires nécessaires existent et les crée si besoin
 */
async function checkDirectories() {
  const spinner = ora('Vérification des répertoires...').start();
  
  try {
    await fs.ensureDir(TEMPLATES_DIR);
    await fs.ensureDir(SERVER_DATA_DIR);
    await fs.ensureDir(path.join(SERVER_DATA_DIR, 'pages'));
    await fs.ensureDir(path.join(SERVER_DATA_DIR, 'themes'));
    await fs.ensureDir(path.join(SERVER_DATA_DIR, 'versions'));
    await fs.ensureDir(path.join(SERVER_DATA_DIR, 'settings'));
    await fs.ensureDir(path.join(SERVER_DATA_DIR, 'media'));
    
    spinner.succeed('Répertoires vérifiés et créés si nécessaire');
  } catch (error) {
    spinner.fail('Erreur lors de la vérification des répertoires');
    throw error;
  }
}

/**
 * Demande à l'utilisateur de fournir le chemin du template HTML
 */
async function promptForTemplate() {
  console.log(chalk.yellow('Template HTML original non trouvé.'));
  
  const { templatePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'templatePath',
      message: 'Veuillez entrer le chemin du fichier HTML original:',
      validate: async (input) => {
        if (!input) return 'Le chemin ne peut pas être vide';
        if (!await fs.pathExists(input)) return 'Le fichier n\'existe pas';
        if (path.extname(input) !== '.html') return 'Le fichier doit être au format HTML';
        return true;
      }
    }
  ]);
  
  // Copier le template
  const spinner = ora('Copie du template HTML...').start();
  try {
    await fs.copy(templatePath, ORIGINAL_TEMPLATE_PATH);
    spinner.succeed('Template HTML copié avec succès');
  } catch (error) {
    spinner.fail('Erreur lors de la copie du template HTML');
    throw error;
  }
}

/**
 * Initialise les données du CMS à partir du template HTML
 */
async function initializeData() {
  const spinner = ora('Initialisation des données...').start();
  
  try {
    // Exécuter le script d'initialisation du contenu
    const initScript = path.join(__dirname, 'server', 'init-content.js');
    await executeCommand('node', [initScript]);
    
    spinner.succeed('Données initialisées avec succès');
  } catch (error) {
    spinner.fail('Erreur lors de l\'initialisation des données');
    throw error;
  }
}

/**
 * Installe les dépendances du projet
 */
async function installDependencies() {
  console.log(chalk.cyan('\nInstallation des dépendances...'));
  
  // Installer les dépendances principales
  await executeCommand('npm', ['install'], { stdio: 'inherit' });
  
  // Installer les dépendances du client
  console.log(chalk.cyan('\nInstallation des dépendances du client...'));
  await executeCommand('npm', ['install'], { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  // Installer les dépendances des fonctions
  console.log(chalk.cyan('\nInstallation des dépendances des fonctions...'));
  await executeCommand('npm', ['install'], { cwd: path.join(__dirname, 'functions'), stdio: 'inherit' });
}

/**
 * Exécute une commande système
 */
async function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);
    
    if (!options.stdio) {
      process.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      process.stderr.on('data', (data) => {
        console.error(data.toString());
      });
    }
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`La commande a échoué avec le code ${code}`));
      }
    });
  });
}

// Exécuter l'initialisation
initialize();