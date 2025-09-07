/**
 * Chat API service for communicating with local Ollama backend
 * Handles message processing and response formatting
 */

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}

/**
 * Send a message to the local Ollama API
 * This function will be used by the frontend to communicate with the backend
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  console.log('ChatAPI: Sending message to backend', { messageLength: message.length });
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChatAPI: HTTP error', { status: response.status, errorText });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    console.log('ChatAPI: Response received', { 
      replyLength: data.reply?.length || 0,
      hasError: !!data.error 
    });

    return data;
  } catch (error) {
    console.error('ChatAPI: Request failed', error);
    return {
      reply: 'Sorry, I cannot connect to the local AI service. Please ensure the backend is running on localhost:11434.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}