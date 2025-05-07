import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import chalk from 'chalk';
import { execSync } from 'child_process';
import {
  styles,
  printSectionHeader,
  printSubsectionHeader,
  printSuccess,
  printWarning,
  printError,
  printInfo,
  printListItem,
  printBlankLine
} from '../utils/display.js';

/**
 * Integrate command - Sets up git hooks to run code review on commit
 */
export async function integrateCommand() {
  printSectionHeader('INTEGRATE', 'Setting up git hooks for automatic code review');

  try {
    // Check if git repository exists
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      printError('Not a git repository. Please run this command in a git repository.');
      return;
    }

    // Check if package.json exists
    if (!existsSync('package.json')) {
      printError('No package.json found. Please run this command in a Node.js project.');
      return;
    }

    // Read package.json
    const packageJsonContent = await fs.readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    // Check if husky is already installed
    const hasHusky = packageJson.devDependencies?.husky || packageJson.dependencies?.husky;

    if (!hasHusky) {
      printInfo('Installing husky...');
      try {
        // Install husky
        execSync('npm install husky --save-dev', { stdio: 'inherit' });
        printSuccess('Husky installed successfully.');

        // Initialize husky
        execSync('npx husky init', { stdio: 'inherit' });
        printSuccess('Husky initialized successfully.');
      } catch (error) {
        printError('Failed to install husky:', error);
        return;
      }
    } else {
      printInfo('Husky is already installed.');

      // Check if .husky directory exists, if not initialize husky
      if (!existsSync('.husky')) {
        printInfo('Initializing husky...');
        try {
          execSync('npx husky init', { stdio: 'inherit' });
          printSuccess('Husky initialized successfully.');
        } catch (error) {
          printError('Failed to initialize husky:', error);
          return;
        }
      }
    }

    // Create pre-commit hook
    const preCommitPath = path.join('.husky', 'pre-commit');

    // Check if pre-commit hook already exists
    let preCommitContent = '';
    let preCommitExists = false;

    try {
      preCommitContent = await fs.readFile(preCommitPath, 'utf8');
      preCommitExists = true;
      printInfo('Existing pre-commit hook found.');
    } catch (error) {
      // File doesn't exist, create it
      preCommitContent = '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n';
      printInfo('Creating new pre-commit hook.');
    }

    // Check if cr changes is already in the pre-commit hook
    if (preCommitContent.includes('cr changes')) {
      printWarning('The pre-commit hook already includes cr changes.');
    } else {
      // If the hook exists and has content, make sure we don't break it
      if (preCommitExists) {
        // Check if the file ends with a newline
        if (!preCommitContent.endsWith('\n')) {
          preCommitContent += '\n';
        }

        // Add our command with a comment to make it clear what added it
        preCommitContent += '# Added by cr integrate command\n';
        preCommitContent += 'cr changes\n';

        printInfo('Adding cr changes to existing pre-commit hook.');
      } else {
        // For new hooks, just add our command
        preCommitContent += 'cr changes\n';
      }

      // Write the updated pre-commit hook
      await fs.writeFile(preCommitPath, preCommitContent);

      // Make the pre-commit hook executable
      try {
        execSync(`chmod +x ${preCommitPath}`);
      } catch (error) {
        printWarning('Failed to make pre-commit hook executable. You may need to run: chmod +x .husky/pre-commit');
      }

      printSuccess('Pre-commit hook updated successfully.');
    }

    // Update package.json scripts if needed
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    if (!packageJson.scripts.prepare) {
      packageJson.scripts.prepare = 'husky';

      // Write the updated package.json
      await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
      printSuccess('Added prepare script to package.json.');
    }

    printBlankLine();
    printSuccess('Integration complete! CR will now run automatically on git commit.');
    printInfo('You can bypass the hook with git commit --no-verify if needed.');

  } catch (error) {
    printError('Error setting up git hooks:', error);
  }
}
