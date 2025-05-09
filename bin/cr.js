#!/usr/bin/env node

import { program } from 'commander';
import { initCommand } from '../src/commands/init.js';
import { changesCommand } from '../src/commands/changes.js';
import { indexCommand } from '../src/commands/index.js';
import { integrateCommand } from '../src/commands/integrate.js';
import { modelChangeCommand, modelShowCommand, modelListCommand } from '../src/commands/model.js';
import { getPackageVersion, checkNodeVersion, MIN_NODE_VERSION } from '../src/utils/version.js';
import chalk from 'chalk';

// Check Node.js version
const nodeVersionInfo = checkNodeVersion();
if (!nodeVersionInfo.isSupported) {
  console.error(chalk.yellow(`⚠️ Warning: You are using Node.js ${nodeVersionInfo.currentVersion}`));
  console.error(chalk.yellow(`⚠️ Code Review AI only supports Node.js ${MIN_NODE_VERSION} or above`));
  console.error(chalk.yellow('⚠️ The tool may not function correctly. Please upgrade your Node.js version.'));
  console.error('');
}

// Set up the CLI program
// Get the package version
getPackageVersion().then(version => {
  program
    .name('cr')
    .description('A terminal tool for code review with AI assistance')
    .version(version);

  // Register commands
  program
    .command('init')
    .description('Initialize CR configuration for the current project')
    .action(initCommand);

  program
    .command('changes')
    .description('Review current code changes in git')
    .action(changesCommand);

  program
    .command('index')
    .description('Index current code in the directory')
    .action(indexCommand);

  program
    .command('integrate')
    .description('Set up git hooks to run code review on commit')
    .action(integrateCommand);

  // Model management commands
  const modelCommand = program
    .command('model')
    .description('Manage AI models for code review');

  modelCommand
    .command('change')
    .description('Change the AI model used for code review')
    .action(modelChangeCommand);

  modelCommand
    .command('show')
    .description('Show the current AI model')
    .action(modelShowCommand);

  modelCommand
    .command('list')
    .description('List all available AI models')
    .action(modelListCommand);

  // Add help information
  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ cr init');
    console.log('  $ cr changes');
    console.log('  $ cr index');
    console.log('  $ cr integrate');
    console.log('  $ cr model list');
    console.log('  $ cr model show');
    console.log('  $ cr model change');
  });

  // Parse arguments
  program.parse(process.argv);

  // If no arguments, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
});
