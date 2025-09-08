/**
 * Utility functions for EPS-specific tasks in the EPS Agent project.
 * Handles file reading, prompt construction, and content truncation for validation.
 */

/**
 * Reads a file's content as text using FileReader.
 * @param file - The file to read (e.g., .log, .xml, .txt, .json).
 * @returns A promise resolving to the file's text content.
 * @throws Error if the file cannot be read as text.
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log('epsUtils: File content read', { fileName: file.name, contentLength: content.length });
      resolve(content);
    };
    reader.onerror = () => {
      console.error('epsUtils: Failed to read file', { fileName: file.name });
      reject(new Error(`Failed to read file: ${file.name}. Please ensure it is a valid text-based file.`));
    };
    reader.readAsText(file);
  });
}

/**
 * Constructs the prompt for EPS log validation with Ollama.
 * @param epsLogContent - Raw EPS log content as a string.
 * @param testCaseContent - Test case content as a string (e.g., JSON or plain text).
 * @returns The formatted prompt string for the Ollama API.
 */
export function buildEpsValidationPrompt(epsLogContent: string, testCaseContent: string): string {
  const prompt = `System: You are an EPS log validator. Parse and analyze the following raw EPS log content: [${epsLogContent}]. Validate it against this test case: [${testCaseContent}]. Output in this format: Overall Result: PASS or FAIL. Reasoning and Evidence: [step-by-step analysis with log excerpts]. If the log or test case is malformed, note the issue but attempt validation.\nUser: Validate the test case against the EPS log now.`;
  console.log('epsUtils: Built EPS validation prompt', {
    logLength: epsLogContent.length,
    testCaseLength: testCaseContent.length,
    promptLength: prompt.length
  });
  return prompt;
}

/**
 * Truncates content to avoid exceeding Ollama token limits.
 * @param content - The content to truncate (e.g., EPS log or test case).
 * @param maxLength - Maximum allowed length (default: 10000 characters).
 * @returns Truncated content with a warning if truncated.
 */
export function truncateContent(content: string, maxLength: number = 10000): string {
  if (content.length <= maxLength) {
    return content;
  }
  const truncated = `${content.slice(0, maxLength - 100)}...\n[Content truncated: Original length ${content.length} exceeds limit of ${maxLength} characters. Please use a smaller input or a larger model.]`;
  console.warn('epsUtils: Content truncated', {
    originalLength: content.length,
    maxLength,
    truncatedLength: truncated.length
  });
  return truncated;
}