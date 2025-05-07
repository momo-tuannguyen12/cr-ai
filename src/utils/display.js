import chalk from 'chalk';

/**
 * Display styles for consistent UI
 */
export const styles = {
  // Headers and titles
  header: chalk.cyan,
  subheader: chalk.cyan,
  title: chalk.white,

  // Status indicators
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,

  // Content
  highlight: chalk.yellow,
  code: chalk.magenta,
  path: chalk.cyan.italic,
  command: chalk.cyan,

  // Model-specific
  currentModel: chalk.green,
  modelName: chalk.white,
  modelDescription: chalk.gray,

  // Sections
  sectionTitle: chalk.cyan,

  // Code review specific
  reviewSummary: chalk.green,
  reviewIssue: chalk.red,
  reviewWarning: chalk.yellow,
  reviewSuggestion: chalk.cyan,
  reviewImprovement: chalk.magenta,
  reviewSecurity: chalk.red,
  reviewPerformance: chalk.yellow,
  reviewBestPractice: chalk.blue,

  // Severity levels
  severityCritical: chalk.bgRed.white,
  severityHigh: chalk.red,
  severityMedium: chalk.yellow,
  severityLow: chalk.blue,

  // Code elements
  codeKeyword: chalk.blue,
  codeString: chalk.green,
  codeNumber: chalk.yellow,
  codeComment: chalk.gray.italic,
  codeFunction: chalk.cyan,

  // Misc
  dim: chalk.gray,
  accent: chalk.magenta,
  bold: chalk.white, // Changed from chalk.bold to remove asterisks
  italic: chalk.italic,
  underline: chalk.underline
};

/**
 * Print a section header with optional description
 * @param {string} title - The section title
 * @param {string} description - Optional description
 */
export function printSectionHeader(title, description = '') {
  const width = process.stdout.columns || 80;
  const line = '─'.repeat(width);

  console.log('');
  console.log(styles.header(line));
  console.log(styles.header(` ${title.toUpperCase()}`));
  if (description) {
    console.log(styles.dim(` ${description}`));
  }
  console.log(styles.header(line));
  console.log('');
}

/**
 * Print a subsection header
 * @param {string} title - The subsection title
 */
export function printSubsectionHeader(title) {
  console.log('');
  console.log(styles.sectionTitle(title));
  console.log('');
}

/**
 * Print a success message
 * @param {string} message - The success message
 */
export function printSuccess(message) {
  console.log(styles.success(`✓ ${message}`));
}

/**
 * Print a warning message
 * @param {string} message - The warning message
 */
export function printWarning(message) {
  console.log(styles.warning(`⚠ ${message}`));
}

/**
 * Print an error message
 * @param {string} message - The error message
 * @param {Error} error - Optional error object
 */
export function printError(message, error = null) {
  console.log(styles.error(`✗ ${message}`));
  if (error && error.message) {
    console.log(styles.dim(`  ${error.message}`));
  }
}

/**
 * Print an info message
 * @param {string} message - The info message
 */
export function printInfo(message) {
  console.log(styles.info(`ℹ ${message}`));
}

/**
 * Print a list item
 * @param {string} label - The item label
 * @param {string} value - The item value
 * @param {boolean} highlight - Whether to highlight the value
 */
export function printListItem(label, value, highlight = false) {
  const valueStyle = highlight ? styles.highlight : styles.dim;
  console.log(`  ${styles.title(label)}: ${valueStyle(value)}`);
}

/**
 * Print a command example
 * @param {string} command - The command to display
 * @param {string} description - Optional description
 */
export function printCommandExample(command, description = '') {
  console.log(`  ${styles.command(command)}${description ? ` - ${styles.dim(description)}` : ''}`);
}

/**
 * Print a model item in the list
 * @param {string} name - Model name
 * @param {string} description - Model description
 * @param {boolean} isCurrent - Whether this is the current model
 */
export function printModelItem(name, description, isCurrent = false) {
  const prefix = isCurrent ? styles.currentModel('* ') : '  ';
  const nameStyle = isCurrent ? styles.currentModel : styles.modelName;

  console.log(`${prefix}${nameStyle(name)} - ${styles.modelDescription(description)}`);
}

/**
 * Print a divider line
 */
export function printDivider() {
  const width = process.stdout.columns || 80;
  console.log(styles.dim('─'.repeat(width)));
}

/**
 * Print a blank line
 */
export function printBlankLine() {
  console.log('');
}

/**
 * Print a code review section header
 * @param {string} title - The section title
 * @param {string} type - The type of section (summary, issue, suggestion, etc.)
 */
export function printReviewSectionHeader(title, type = 'general') {
  const typeStyles = {
    summary: styles.reviewSummary,
    issue: styles.reviewIssue,
    warning: styles.reviewWarning,
    suggestion: styles.reviewSuggestion,
    improvement: styles.reviewImprovement,
    security: styles.reviewSecurity,
    performance: styles.reviewPerformance,
    bestPractice: styles.reviewBestPractice,
    general: styles.bold
  };

  const icons = {
    summary: '✓',
    issue: '⚠',
    warning: '⚠',
    suggestion: '💡',
    improvement: '✨',
    security: '🔒',
    performance: '⚡',
    bestPractice: '👍',
    general: '•'
  };

  const style = typeStyles[type] || styles.bold;
  const icon = icons[type] || '•';

  console.log('');
  console.log(`  ${style(icon)} ${style(title.toUpperCase())}`);
}
