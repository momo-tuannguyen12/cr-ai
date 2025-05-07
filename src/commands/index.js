import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadConfig } from '../utils/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function indexCommand() {
  console.log(chalk.blue('Indexing code in current directory...'));
  
  try {
    // Load configuration
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow('CR configuration not found. Run "cr init" first.'));
      return;
    }
    
    const sourcePath = config.index_source_path || '.';
    console.log(chalk.blue(`Using source path: ${sourcePath}`));
    
    // Define file patterns to include
    const patterns = [
      '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx',
      '**/*.py', '**/*.java', '**/*.c', '**/*.cpp',
      '**/*.h', '**/*.hpp', '**/*.cs', '**/*.go',
      '**/*.rb', '**/*.php'
    ];
    
    // Define directories to exclude
    const ignore = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/vendor/**',
      '**/venv/**',
      '**/__pycache__/**'
    ];
    
    // Find all matching files
    console.log(chalk.blue('Searching for code files...'));
    const files = await glob(patterns, {
      cwd: sourcePath,
      ignore,
      absolute: true
    });
    
    if (files.length === 0) {
      console.log(chalk.yellow('No code files found.'));
      return;
    }
    
    console.log(chalk.green(`Found ${files.length} code files.`));
    
    // Create index directory if it doesn't exist
    const indexDir = path.join(process.cwd(), '.cr-index');
    try {
      await fs.mkdir(indexDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    // Create index file with basic information
    const indexData = {
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      files: files.map(file => ({
        path: path.relative(process.cwd(), file),
        size: 0, // Will be updated below
        language: getLanguageFromExtension(file)
      }))
    };
    
    // Update file sizes
    console.log(chalk.blue('Collecting file information...'));
    for (let i = 0; i < indexData.files.length; i++) {
      const file = indexData.files[i];
      try {
        const stats = await fs.stat(path.join(process.cwd(), file.path));
        file.size = stats.size;
      } catch (error) {
        console.error(chalk.yellow(`Could not get size for ${file.path}`));
      }
      
      // Show progress every 100 files
      if (i % 100 === 0 || i === indexData.files.length - 1) {
        console.log(chalk.blue(`Processed ${i + 1}/${indexData.files.length} files...`));
      }
    }
    
    // Write index file
    await fs.writeFile(
      path.join(indexDir, 'index.json'),
      JSON.stringify(indexData, null, 2)
    );
    
    console.log(chalk.green('Code indexing completed successfully!'));
    console.log(chalk.blue(`Index stored in ${path.join(indexDir, 'index.json')}`));
  } catch (error) {
    console.error(chalk.red('Error indexing code:'), error);
  }
}

function getLanguageFromExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.py': 'Python',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.hpp': 'C++ Header',
    '.cs': 'C#',
    '.go': 'Go',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.json': 'JSON',
    '.md': 'Markdown'
  };
  
  return languageMap[ext] || 'Unknown';
}
