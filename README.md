# CR - Code Review Tool

A terminal-based code review tool from git changes (before commit) with AI assistance using Google's Gemini API.

## Features

1. **Index code**: Index current code in your project directory
2. **Initialize configuration**: Set up the CR tool with a configuration file (CR.json)
3. **Review code changes**: Automatically review git changes with AI assistance
4. **Customizable rules**: Define your own code review rules
5. **AI-powered**: Uses Google's Gemini API for intelligent code review

## Installation

```bash
npm install -g cr-ai
```

## Configuration

The tool uses a `CR.json` file for configuration with the following structure:

```json
{
    "index_source_path": "path to index source code",
    "rules": [
        "Check for security vulnerabilities",
        "Ensure proper error handling",
        "Verify code follows best practices"
    ],
    "gemini_api_key": "your gemini api key",
    "model_name": "gemini-2.0-flash",
    "instruction": "Review this code for bugs, security issues, and best practices."
}
```

The `model_name` field specifies which Gemini model to use for code review. Supported models:
- `gemini-2.0-flash` (default): Faster, more efficient model
- `gemini-1.5-flash`: Balanced performance model
- `gemini-2.5-flash-preview-04-17`: Latest preview model with advanced capabilities

## Usage

### Initialize the tool

```bash
cr init
```

This will guide you through creating a `CR.json` configuration file.

### Index your code

```bash
cr index
```

This will scan and index your codebase for better context during reviews.

### Review code changes

```bash
cr changes
```

This will analyze your git changes and provide AI-powered code review feedback.

### Manage AI models

#### List available models

```bash
cr model list
```

This will display all available AI models for code review.

#### Show current model

```bash
cr model show
```

This will display the currently configured AI model.

#### Change the model

```bash
cr model change
```

This will allow you to select a different AI model for code review.

## Requirements

- Node.js >= 18
- Git repository (for the `changes` command)
- Gemini API key (optional, but recommended for AI features)

## License

MIT