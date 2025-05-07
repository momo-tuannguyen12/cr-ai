import path from 'path';
import simpleGit from 'simple-git';
import { reviewCode } from '../utils/reviewer.js';
import { loadConfig } from '../utils/config.js';
import {
  styles,
  printSectionHeader,
  printSubsectionHeader,
  printSuccess,
  printWarning,
  printError,
  printInfo,
  printListItem,
  printDivider,
  printBlankLine
} from '../utils/display.js';

export async function changesCommand() {
  printSectionHeader('CODE REVIEW', 'Reviewing changes in your git repository');

  try {
    // Load configuration
    const config = await loadConfig();
    if (!config) {
      printWarning('CR configuration not found. Run "cr init" first.');
      return;
    }

    // Initialize git
    const git = simpleGit();

    // Check if git repository exists
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      printError('Not a git repository. Please run this command in a git repository.');
      return;
    }

    // Get changed files
    printInfo('Checking for changes in your repository...');
    const status = await git.status();
    const changedFiles = [
      ...status.modified,
      ...status.created,
      ...status.renamed.map(file => file.to)
    ];

    if (changedFiles.length === 0) {
      printWarning('No changed files found in your repository.');
      printInfo('Make some changes and try again, or commit your current changes.');
      return;
    }

    // Display changed files
    printSubsectionHeader(`Found ${changedFiles.length} Changed Files`);
    changedFiles.forEach(file => {
      let fileType = 'Unknown';
      const extension = path.extname(file).toLowerCase();

      // Determine file type based on extension
      if (/\.(js|jsx|ts|tsx)$/i.test(extension)) fileType = 'JavaScript/TypeScript';
      else if (/\.(py)$/i.test(extension)) fileType = 'Python';
      else if (/\.(java)$/i.test(extension)) fileType = 'Java';
      else if (/\.(c|cpp|h|hpp)$/i.test(extension)) fileType = 'C/C++';
      else if (/\.(cs)$/i.test(extension)) fileType = 'C#';
      else if (/\.(go)$/i.test(extension)) fileType = 'Go';
      else if (/\.(rb)$/i.test(extension)) fileType = 'Ruby';
      else if (/\.(php)$/i.test(extension)) fileType = 'PHP';
      else if (/\.(html|css|scss)$/i.test(extension)) fileType = 'Web';
      else if (/\.(json|md|txt)$/i.test(extension)) fileType = 'Text';

      console.log(`  ${styles.success('•')} ${styles.path(file)} ${styles.dim(`(${fileType})`)}`);
    });

    printBlankLine();
    printInfo(`Using model: ${styles.highlight(config.model_name || 'gemini-2.0-flash')}`);
    printDivider();

    // Review each file
    let reviewedCount = 0;
    let skippedCount = 0;

    for (const file of changedFiles) {
      try {
        // Skip binary files and non-text files
        if (!file.match(/\.(js|jsx|ts|tsx|py|java|c|cpp|h|hpp|cs|go|rb|php|html|css|scss|json|md|txt)$/i)) {
          printWarning(`Skipping likely binary file: ${styles.path(file)}`);
          skippedCount++;
          continue;
        }

        const diff = await git.diff([file]);
        if (!diff) {
          printWarning(`No diff available for ${styles.path(file)}`);
          skippedCount++;
          continue;
        }

        // Print file header
        printSubsectionHeader(`Reviewing ${path.basename(file)}`);
        printListItem('File', file);
        printListItem('Changes', `${diff.split('\\n').length} lines`);
        printBlankLine();

        // Show processing message
        // printInfo('Analyzing code and generating review...');

        // Review the code changes
        const review = await reviewCode(diff, config);

        // Format and display the review
        formatAndDisplayReview(review, file, config);

        reviewedCount++;
      } catch (error) {
        printError(`Error processing ${file}:`, error);
      }
    }

    // Print summary
    printSectionHeader('REVIEW SUMMARY', 'Results of code review');
    printListItem('Files reviewed', `${reviewedCount}/${changedFiles.length}`);
    printListItem('Files skipped', `${skippedCount}`);
    printListItem('Model used', config.model_name || 'gemini-2.0-flash', true);

    printBlankLine();
    printSuccess('Code review completed successfully!');
  } catch (error) {
    printError('Error reviewing code changes:', error);
  }
}

/**
 * Format and display the review results in a structured way
 * @param {string} review - The review text from the AI
 * @param {string} _file - The file being reviewed (unused but kept for API consistency)
 * @param {Object} config - The CR configuration
 */
function formatAndDisplayReview(review, _file, config) {
  // Check if colors should be used (default to true if not specified)
  const useColors = config.use_colors !== false;
  if (!review) {
    console.log('No review generated.');
    return;
  }

  // Check if the review is an error message
  if (review.startsWith('Error reviewing code:') || review.startsWith('⚠️ No Gemini API key found')) {
    console.log(review);
    return;
  }

  // Clean up the review text
  let cleanedReview = review;

  // Remove markdown formatting
  cleanedReview = cleanedReview.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Remove bold
  cleanedReview = cleanedReview.replace(/(\*|_)(.*?)\1/g, '$2');    // Remove italic
  cleanedReview = cleanedReview.replace(/^#+\s+/gm, '');            // Remove headers

  // Process code blocks with triple backticks
  const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
  let match;
  let processedReview = '';
  let lastIndex = 0;

  while ((match = codeBlockRegex.exec(cleanedReview)) !== null) {
    // Add text before the code block
    processedReview += cleanedReview.substring(lastIndex, match.index);

    // Get the code and language
    const language = match[1] || '';
    const code = match[2];

    // Add the highlighted code block
    processedReview += '\n';

    if (useColors) {
      processedReview += styles.dim('--- Code Block' + (language ? ` (${language})` : '') + ' ---');
    } else {
      processedReview += '--- Code Block' + (language ? ` (${language})` : '') + ' ---';
    }

    processedReview += '\n';

    // Split the code into lines and highlight each line
    const codeLines = code.split('\n');
    codeLines.forEach(line => {
      if (useColors) {
        processedReview += styles.code(line) + '\n';
      } else {
        processedReview += line + '\n';
      }
    });

    if (useColors) {
      processedReview += styles.dim('--- End Code Block ---');
    } else {
      processedReview += '--- End Code Block ---';
    }

    processedReview += '\n';

    // Update the last index
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  processedReview += cleanedReview.substring(lastIndex);

  // Highlight inline code with single backticks
  if (useColors) {
    processedReview = processedReview.replace(/`([^`]+)`/g, (_, code) => styles.code(code));
  } else {
    processedReview = processedReview.replace(/`([^`]+)`/g, (_, code) => code);
  }

  // Replace asterisk bullet points with dashes
  processedReview = processedReview.replace(/^\s*\*/gm, '-');

  // Remove any remaining asterisks
  processedReview = processedReview.replace(/\*/g, '');

  // Apply colorful headers to common sections if colors are enabled
  if (useColors) {
    // This regex matches lines that look like section headers (capitalized words followed by a colon or all caps)
    const headerRegex = /^([A-Z][A-Za-z\s]+:|\b[A-Z]{2,}[A-Z\s]+\b)/gm;

    processedReview = processedReview.replace(headerRegex, (header) => {
      const lowerHeader = header.toLowerCase();

      // Determine the type of header and apply appropriate styling
      if (lowerHeader.includes('summary') || lowerHeader.includes('overview')) {
        return styles.reviewSummary.bold(header);
      } else if (lowerHeader.includes('issue') || lowerHeader.includes('bug') || lowerHeader.includes('error')) {
        return styles.reviewIssue.bold(header);
      } else {
        // All other headers use cyan color
        return styles.sectionTitle.bold(header);
      }
    });
  }

  // Add a divider before the review
  if (useColors) {
    console.log(styles.dim('─'.repeat(process.stdout.columns || 80)));
  } else {
    console.log('─'.repeat(process.stdout.columns || 80));
  }

  // Print the processed review text
  console.log('\n' + processedReview + '\n');

  // Add a divider after the review
  if (useColors) {
    console.log(styles.dim('─'.repeat(process.stdout.columns || 80)));
  } else {
    console.log('─'.repeat(process.stdout.columns || 80));
  }
}


