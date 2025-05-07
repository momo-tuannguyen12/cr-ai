#!/usr/bin/env node

import { program } from 'commander';
import { initCommand } from '../src/commands/init.js';
import { changesCommand } from '../src/commands/changes.js';
import { indexCommand } from '../src/commands/index.js';
import { modelChangeCommand, modelShowCommand, modelListCommand } from '../src/commands/model.js';
import { getPackageVersion } from '../src/utils/version.js';
import chalk from 'chalk';

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
