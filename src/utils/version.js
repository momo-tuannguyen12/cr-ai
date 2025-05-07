import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Minimum supported Node.js version
export const MIN_NODE_VERSION = 18;

/**
 * Get the package version from package.json
 * @returns {Promise<string>} The package version
 */
export async function getPackageVersion() {
  try {
    // Resolve the path to package.json (two directories up from this file)
    const packagePath = resolve(__dirname, '../../package.json');

    // Read and parse package.json
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));

    return packageJson.version;
  } catch (error) {
    console.error('Error reading package version:', error);
    return '0.0.0'; // Fallback version
  }
}

/**
 * Check if the current Node.js version meets the minimum requirement
 * @returns {Object} Object containing version info and check result
 */
export function checkNodeVersion() {
  // Get the current Node.js version
  const nodeVersion = process.version;

  // Extract the major version number (e.g., from 'v18.12.1' to 18)
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);

  // Check if the version meets the minimum requirement
  const isSupported = majorVersion >= MIN_NODE_VERSION;

  return {
    currentVersion: nodeVersion,
    majorVersion,
    minVersion: MIN_NODE_VERSION,
    isSupported
  };
}
