import { buildEpsValidationPrompt, truncateContent } from '@/lib/epsUtils';

/**
 * Chat API service for communicating with local Ollama backend
 * Handles message processing and EPS log validation
 */
export interface ChatRequest {
  message: string;
  epsLogContent?: string;
  testCaseContent?: string;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}

/**
 * Send a message to the local Ollama API for chat or EPS validation
 * Supports raw EPS log and test case content for direct validation
 */
export async function sendChatMessage({ message, epsLogContent, testCaseContent }: ChatRequest): Promise<ChatResponse> {
  console.log('ChatAPI: Sending message to backend', { 
    messageLength: message.length,
    logLength: epsLogContent?.length || 0,
    testCaseLength: testCaseContent?.length || 0,
    epsLogPreview: epsLogContent?.substring(0, 100) + (epsLogContent && epsLogContent.length > 100 ? '...' : ''),
    testCasePreview: testCaseContent?.substring(0, 100) + (testCaseContent && testCaseContent.length > 100 ? '...' : '')
  });

  try {
    let prompt = message;
    if (epsLogContent && testCaseContent) {
      // Truncate inputs to avoid Ollama token limit issues
      const truncatedLog = truncateContent(epsLogContent);
      const truncatedTestCase = truncateContent(testCaseContent);
      // Use utility for prompt construction
      prompt = buildEpsValidationPrompt(truncatedLog, truncatedTestCase);
    }

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemma3:1b",
        messages: [{ role: "user", content: prompt }],
        stream: false // Set to true for streaming if desired
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChatAPI: HTTP error', { status: response.status, errorText });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const reply = data?.message?.content || data?.content || "No reply from model";
    console.log('ChatAPI: Response received', { 
      replyLength: reply.length,
      replyPreview: reply.substring(0, 100) + (reply.length > 100 ? '...' : ''),
      hasError: !!data.error 
    });

    return { reply };
  } catch (error) {
    console.error('ChatAPI: Request failed', error);
    return {
      reply: 'Sorry, I cannot connect to the local AI service. Please ensure Ollama is running on localhost:11434 and the model is loaded.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}