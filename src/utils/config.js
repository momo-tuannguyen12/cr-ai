import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/**
 * Load CR configuration from CR.json
 * @returns {Promise<Object|null>} Configuration object or null if not found
 */
export async function loadConfig() {
  try {
    const configPath = path.join(process.cwd(), 'CR.json');
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    console.error(chalk.red('Error loading configuration:'), error);
    return null;
  }
}

/**
 * Save CR configuration to CR.json
 * @param {Object} config - Configuration object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveConfig(config) {
  try {
    const configPath = path.join(process.cwd(), 'CR.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error(chalk.red('Error saving configuration:'), error);
    return false;
  }
}
