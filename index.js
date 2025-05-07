// Main entry point for the cr package
import { initCommand } from './src/commands/init.js';
import { changesCommand } from './src/commands/changes.js';
import { indexCommand } from './src/commands/index.js';
import { modelChangeCommand, modelShowCommand, modelListCommand } from './src/commands/model.js';
import { loadConfig, saveConfig } from './src/utils/config.js';
import { reviewCode } from './src/utils/reviewer.js';
import { styles, printSectionHeader, printSubsectionHeader, printSuccess, printWarning, printError, printInfo } from './src/utils/display.js';

// Export all functionality for programmatic use
export {
  // Commands
  initCommand,
  changesCommand,
  indexCommand,
  modelChangeCommand,
  modelShowCommand,
  modelListCommand,

  // Utilities
  loadConfig,
  saveConfig,
  reviewCode,

  // Display utilities
  styles,
  printSectionHeader,
  printSubsectionHeader,
  printSuccess,
  printWarning,
  printError,
  printInfo
};

// Export default object
export default {
  // Commands
  init: initCommand,
  changes: changesCommand,
  index: indexCommand,
  model: {
    change: modelChangeCommand,
    show: modelShowCommand,
    list: modelListCommand
  },

  // Utilities
  loadConfig,
  saveConfig,
  reviewCode,

  // Display utilities
  display: {
    styles,
    printSectionHeader,
    printSubsectionHeader,
    printSuccess,
    printWarning,
    printError,
    printInfo
  }
};
