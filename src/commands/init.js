import fs from 'fs/promises';
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Updates the .gitignore file to include CR.json
 */
async function updateGitignore() {
  const gitignorePath = '.gitignore';
  const entryToAdd = 'CR.json';

  try {
    // Check if .gitignore exists
    if (existsSync(gitignorePath)) {
      // Read the content of .gitignore
      const content = readFileSync(gitignorePath, 'utf8');
      const lines = content.split('\n');

      // Check if CR.json is already in .gitignore
      if (!lines.some(line => line.trim() === entryToAdd)) {
        // Add CR.json to .gitignore
        console.log(chalk.blue('Adding CR.json to .gitignore...'));

        // Add a newline if the file doesn't end with one
        const appendContent = content.endsWith('\n') ? entryToAdd : `\n${entryToAdd}`;
        appendFileSync(gitignorePath, `${appendContent}\n`);

        console.log(chalk.green('Added CR.json to .gitignore successfully!'));
      } else {
        console.log(chalk.blue('CR.json is already in .gitignore.'));
      }
    } else {
      // Ask if the user wants to create a .gitignore file
      const { createGitignore } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createGitignore',
          message: '.gitignore file not found. Do you want to create it?',
          default: true
        }
      ]);

      if (createGitignore) {
        // Create .gitignore with CR.json
        console.log(chalk.blue('Creating .gitignore file...'));
        writeFileSync(gitignorePath, `${entryToAdd}\n`);
        console.log(chalk.green('.gitignore file created with CR.json entry!'));
      } else {
        console.log(chalk.yellow('Skipped creating .gitignore file.'));
      }
    }
  } catch (error) {
    console.error(chalk.yellow('Warning: Could not update .gitignore:'), error.message);
    console.log(chalk.yellow('Please add CR.json to your .gitignore file manually.'));
  }
}

export async function initCommand() {
  console.log(chalk.blue('Initializing CR configuration...'));

  try {
    // Check if CR.json already exists
    try {
      await fs.access('CR.json');
      const overwrite = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'CR.json already exists. Do you want to overwrite it?',
          default: false
        }
      ]);

      if (!overwrite.confirm) {
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }
    } catch (error) {
      // File doesn't exist, continue with initialization
    }

    // Prompt for configuration values
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'indexSourcePath',
        message: 'Path to index source code (relative to current directory):',
        default: '.'
      },
      {
        type: 'input',
        name: 'geminiApiKey',
        message: 'Your Gemini API key (leave empty to configure later):'
      },
      {
        type: 'list',
        name: 'modelName',
        message: 'Select Gemini model to use:',
        choices: [
          { name: 'Gemini 2.0 Flash (faster, more efficient)', value: 'gemini-2.0-flash' },
          { name: 'Gemini 1.5 Flash (balanced performance)', value: 'gemini-1.5-flash' },
          { name: 'Gemini 2.5 Flash Preview (latest preview model)', value: 'gemini-2.5-flash-preview-04-17' }
        ],
        default: 'gemini-2.0-flash'
      },
      {
        type: 'input',
        name: 'instruction',
        message: 'Default instruction for code review:',
        default: 'Review this code for bugs, security issues, and best practices.'
      }
    ]);

    // Create default rules
    const defaultRules = [
      "Check for security vulnerabilities",
      "Ensure proper error handling",
      "Verify code follows best practices"
    ];

    // Create configuration object
    const config = {
      index_source_path: answers.indexSourcePath,
      rules: defaultRules,
      gemini_api_key: answers.geminiApiKey,
      model_name: answers.modelName,
      instruction: answers.instruction
    };

    // Write configuration to CR.json
    await fs.writeFile('CR.json', JSON.stringify(config, null, 2));

    // Update .gitignore to include CR.json
    await updateGitignore();

    console.log(chalk.green('CR.json created successfully!'));
    console.log(chalk.blue('You can now use:'));
    console.log(chalk.blue('  cr index - to index your code'));
    console.log(chalk.blue('  cr changes - to review git changes'));
  } catch (error) {
    console.error(chalk.red('Error initializing CR configuration:'), error);
  }
}
