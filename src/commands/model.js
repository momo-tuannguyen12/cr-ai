import inquirer from 'inquirer';
import { loadConfig, saveConfig } from '../utils/config.js';
import {
  styles,
  printSectionHeader,
  printSubsectionHeader,
  printSuccess,
  printWarning,
  printError,
  printInfo,
  printListItem,
  printModelItem,
  printDivider,
  printBlankLine,
  printCommandExample
} from '../utils/display.js';

/**
 * Command to change the model used for code review
 */
export async function modelChangeCommand() {
  printSectionHeader('MODEL CHANGE', 'Change the AI model used for code review');

  try {
    // Load existing configuration
    const config = await loadConfig();
    if (!config) {
      printWarning('CR configuration not found. Run "cr init" first.');
      return;
    }

    // Define supported models
    const supportedModels = [
      { name: 'Gemini 2.0 Flash (faster, more efficient)', value: 'gemini-2.0-flash' },
      { name: 'Gemini 1.5 Flash (balanced performance)', value: 'gemini-1.5-flash' },
      { name: 'Gemini 2.5 Flash Preview (latest preview model)', value: 'gemini-2.5-flash-preview-04-17' }
    ];

    // Get current model
    const currentModel = config.model_name || 'gemini-2.0-flash';

    printSubsectionHeader('Current Configuration');
    printListItem('Model', currentModel, true);
    printBlankLine();

    // Prompt user to select a new model
    printInfo('Please select a new model from the list below:');
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'modelName',
        message: 'Select a new model to use:',
        choices: supportedModels,
        default: currentModel
      }
    ]);

    printBlankLine();

    // If the model hasn't changed, inform the user and exit
    if (answer.modelName === currentModel) {
      printWarning('No change: You selected the same model that is currently configured.');
      return;
    }

    // Update the configuration
    config.model_name = answer.modelName;

    // Save the updated configuration
    const success = await saveConfig(config);

    if (success) {
      printSuccess(`Model successfully changed to: ${styles.highlight(answer.modelName)}`);
      printBlankLine();
      printInfo('This model will be used for all future code reviews.');
    } else {
      printError('Failed to save configuration.');
    }
  } catch (error) {
    printError('Error changing model', error);
  }
}

/**
 * Command to show the current model
 */
export async function modelShowCommand() {
  printSectionHeader('MODEL INFO', 'Information about the current AI model');

  try {
    // Load existing configuration
    const config = await loadConfig();
    if (!config) {
      printWarning('CR configuration not found. Run "cr init" first.');
      return;
    }

    // Get current model
    const currentModel = config.model_name || 'gemini-2.0-flash';

    // Display model information
    printSubsectionHeader('Current Model');
    printListItem('Name', currentModel, true);

    // Show additional information based on the model
    let modelDescription = '';
    let modelCapabilities = [];
    let modelUseCases = [];

    switch (currentModel) {
      case 'gemini-2.0-flash':
        modelDescription = 'A faster, more efficient model for code review';
        modelCapabilities = [
          'Optimized for speed and efficiency',
          'Good balance between performance and quality',
          'Suitable for most code review tasks'
        ];
        modelUseCases = [
          'Quick code reviews',
          'Syntax and style checking',
          'Basic security analysis'
        ];
        break;
      case 'gemini-1.5-flash':
        modelDescription = 'A balanced performance model for code review';
        modelCapabilities = [
          'Balanced performance characteristics',
          'Good for general code review',
          'Efficient for medium-sized codebases'
        ];
        modelUseCases = [
          'General code reviews',
          'Best practices analysis',
          'Code structure suggestions'
        ];
        break;
      case 'gemini-2.5-flash-preview-04-17':
        modelDescription = 'The latest preview model with advanced capabilities';
        modelCapabilities = [
          'Cutting-edge AI capabilities',
          'Advanced code understanding',
          'Preview of upcoming features'
        ];
        modelUseCases = [
          'Complex code analysis',
          'Advanced security reviews',
          'Architectural suggestions'
        ];
        break;
      default:
        printWarning(`Note: ${currentModel} is not one of the officially supported models.`);
        return;
    }

    printListItem('Description', modelDescription);
    printBlankLine();

    printSubsectionHeader('Capabilities');
    modelCapabilities.forEach(capability => {
      console.log(`  ${styles.success('✓')} ${capability}`);
    });
    printBlankLine();

    printSubsectionHeader('Recommended Use Cases');
    modelUseCases.forEach(useCase => {
      console.log(`  ${styles.info('•')} ${useCase}`);
    });
    printBlankLine();

    printInfo('To change the model, use the command:');
    printCommandExample('cr model change');

  } catch (error) {
    printError('Error showing model', error);
  }
}

/**
 * Command to list all available models
 */
export async function modelListCommand() {
  printSectionHeader('AVAILABLE MODELS', 'List of supported AI models for code review');

  try {
    // Load existing configuration to get current model
    const config = await loadConfig();
    const currentModel = config ? (config.model_name || 'gemini-2.0-flash') : 'gemini-2.0-flash';

    // Define supported models with descriptions
    const supportedModels = [
      {
        name: 'gemini-2.0-flash',
        description: 'Faster, more efficient model',
        details: 'Optimized for speed and efficiency, good for most code review tasks'
      },
      {
        name: 'gemini-1.5-flash',
        description: 'Balanced performance model',
        details: 'Good balance of capabilities, suitable for general code review'
      },
      {
        name: 'gemini-2.5-flash-preview-04-17',
        description: 'Latest preview model with advanced capabilities',
        details: 'Cutting-edge features, best for complex code analysis'
      }
    ];

    // Display models
    printSubsectionHeader('Models');
    supportedModels.forEach(model => {
      const isCurrent = model.name === currentModel;
      printModelItem(model.name, model.description, isCurrent);

      // If this is the current model, add more details
      if (isCurrent) {
        console.log(`    ${styles.dim(model.details)}`);
        console.log(`    ${styles.success('✓')} Currently selected`);
        printBlankLine();
      } else {
        console.log(`    ${styles.dim(model.details)}`);
        printBlankLine();
      }
    });

    printDivider();
    printInfo('To change the model, use the command:');
    printCommandExample('cr model change');
    printBlankLine();

    printInfo('To see details about the current model:');
    printCommandExample('cr model show');
    printBlankLine();
  } catch (error) {
    printError('Error listing models', error);
  }
}
