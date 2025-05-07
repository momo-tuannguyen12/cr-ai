import dotenv from 'dotenv';
import { styles, printInfo, printWarning } from './display.js';

// Load environment variables
dotenv.config();

/**
 * Review code using Gemini API
 * @param {string} codeContent - The code content to review
 * @param {Object} config - CR configuration
 * @returns {Promise<string>} Review results
 */
export async function reviewCode(codeContent, config) {
  // Check if Gemini API key is available
  const apiKey = config.gemini_api_key || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `
⚠️ No Gemini API key found

Please add your Gemini API key to CR.json or set it as an environment variable (GEMINI_API_KEY).
You can get a Gemini API key from https://ai.google.dev/

For now, here's a basic analysis:

Summary:
The code contains approximately ${codeContent.split('\n').length} lines with ${codeContent.length} characters.

Recommendation:
To get a detailed code review, please configure your Gemini API key using:
- Add it to CR.json file
- Or set the GEMINI_API_KEY environment variable
`;
  }

  try {
    // printInfo('Sending code to Gemini API for review...');

    // Prepare the instruction
    const instruction = config.instruction || config.prompt || 'Review this code for bugs, security issues, and best practices.';
    const rules = config.rules || [];

    let fullInstruction = `${instruction}\n\n`;

    if (rules.length > 0) {
      fullInstruction += 'Please check for the following:\n';
      rules.forEach(rule => {
        fullInstruction += `- ${rule}\n`;
      });
      fullInstruction += '\n';
    }

    // Add specific formatting instructions based on review mode
    if (config.light_review) {
      // Light review mode - only ISSUES and BEST PRACTICES
      fullInstruction += `
Please provide a focused code review with ONLY these two sections:

ISSUES:
List any issues, bugs, or errors found in the code (if any)

BEST PRACTICES:
Note any best practices that should be followed or improvements that could be made

Include code examples where appropriate using triple backticks.

IMPORTANT:
- DO NOT use any asterisks (*) or markdown formatting in your response.
- DO NOT use **, *, or any other markdown syntax. Use plain text only.
- For bullet points, use - instead of *. For emphasis, use ALL CAPS instead of asterisks.
- ALWAYS use the EXACT section headers listed above (in ALL CAPS followed by a colon).
- If a section doesn't apply (e.g., no issues found), still include the header but note "No issues found."
- IMPORTANT: Do not use lines that start or end with "━━━━ Code Block ━━━━" or "━━━━ End Code Block ━━━━" as these are reserved for formatting.
`;
    } else {
      // Full review mode - all sections
      fullInstruction += `
Please format your response with clear section headers for better readability.
Use the following structure with EXACTLY these section headers:

SUMMARY:
A brief summary of the changes

ISSUES:
List any issues or bugs found (if any)

SUGGESTIONS:
Provide suggestions for improvements (if any)

BEST PRACTICES:
Note any best practices that should be followed

SECURITY:
Mention any security concerns (if applicable)

PERFORMANCE:
Note any performance considerations (if applicable)

CONCLUSION:
A brief conclusion

Include code examples where appropriate using triple backticks.

IMPORTANT:
- DO NOT use any asterisks (*) or markdown formatting in your response.
- DO NOT use **, *, or any other markdown syntax. Use plain text only.
- For bullet points, use - instead of *. For emphasis, use ALL CAPS instead of asterisks.
- ALWAYS use the EXACT section headers listed above (in ALL CAPS followed by a colon).
- If a section doesn't apply, you can skip it entirely.
- IMPORTANT: Do not use lines that start or end with "━━━━ Code Block ━━━━" or "━━━━ End Code Block ━━━━" as these are reserved for formatting.
`;
    }

    fullInstruction += `
Here is the code diff to review:

\`\`\`
${codeContent}
\`\`\`
`;

    // Get model name from config or use default
    let modelName = config.model_name || 'gemini-2.0-flash';

    // Validate model name - ensure it's one of the supported models
    const supportedModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-preview-04-17'];
    if (!supportedModels.includes(modelName)) {
      printWarning(`Model ${modelName} not supported. Falling back to gemini-2.0-flash.`);
      modelName = 'gemini-2.0-flash';
    }

    // printInfo(`Using model: ${styles.highlight(modelName)}`);

    // Call Gemini API
    const response = await callGeminiAPI(apiKey, fullInstruction, modelName);
    return response;
  } catch (error) {
    console.error(styles.error('Error calling Gemini API:'), error);
    return `
Error reviewing code

Summary:
An error occurred while trying to review the code with the Gemini API.

Details:
${error.message}

Recommendation:
- Check your internet connection
- Verify your API key is correct
- Try again later or use a different model
`;
  }
}

/**
 * Call the Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {string} instruction - The instruction to send
 * @param {string} modelName - The model name to use
 * @returns {Promise<string>} API response
 */
async function callGeminiAPI(apiKey, instruction, modelName = 'gemini-2.0-flash') {
  // Validate model name again as a safety check
  const supportedModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-preview-04-17'];
  if (!supportedModels.includes(modelName)) {
    printWarning(`Model ${modelName} not supported in API call. Using gemini-2.0-flash instead.`);
    modelName = 'gemini-2.0-flash';
  }
  try {
    // Construct the API URL with the model name
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: instruction
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract the response text
    if (data.candidates && data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    throw error;
  }
}
