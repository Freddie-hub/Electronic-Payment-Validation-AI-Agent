import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onTestCaseDetected?: () => void; // Callback to trigger file upload modal
}

/**
 * Main chat interface component for user-agent communication
 * Handles message display, input, test case detection, and real-time chat functionality
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onTestCaseDetected
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('ChatInterface: Messages updated, scrolling to bottom', { messageCount: messages.length });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) {
      console.log('ChatInterface: Message submission blocked', { 
        messageEmpty: !inputMessage.trim(), 
        isLoading 
      });
      return;
    }

    // Detect test case content (JSON or XML-like)
    const isTestCase = /{TestCaseID|StepNo\b|<StepNo/i.test(inputMessage);
    if (isTestCase && onTestCaseDetected) {
      console.log('ChatInterface: Test case detected in input', { inputMessage });
      onSendMessage(inputMessage.trim());
      onTestCaseDetected();
      setInputMessage('');
      return;
    }

    console.log('ChatInterface: Sending message', { message: inputMessage });
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg mb-2">Welcome to EPS Agent</p>
              <p>Start a conversation, paste a test case, or upload an EPS log file to begin validation.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-secondary text-secondary-foreground mr-4'
                  }`}
                >
                  {/* Format test case content in user messages */}
                  {message.role === 'user' && /{TestCaseID|StepNo\b|<StepNo/i.test(message.content) ? (
                    <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-2 rounded">
                      {message.content}
                    </pre>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 mr-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>EPS Agent is validating...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input Area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                console.log('ChatInterface: Input updated', { length: e.target.value.length });
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or paste a test case... (Press Enter to send, Shift+Enter for new line)"
              className="resize-none min-h-[44px] max-h-32"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};