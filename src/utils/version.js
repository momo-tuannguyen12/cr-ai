import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
