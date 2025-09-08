import React, { useState, useCallback } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { EpsConfirmation } from '@/components/chat/EpsConfirmation';
import { ShowListOfTasks } from '@/components/tasks/ShowListOfTasks';
import { ShowCompletionAndJustification } from '@/components/tasks/ShowCompletionAndJustification';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { 
  ChatMessage, 
  ChatReply, 
  Task, 
  AppState, 
  EpsConfirmationData, 
  ApiResponse 
} from '@/types/chat';
import { buildEpsValidationPrompt, truncateContent } from '@/lib/epsUtils';

/**
 * Main chat page component that orchestrates the entire EPS Agent interface
 * Manages state transitions between chatting, task processing, and completion modes
 */
export const ChatPage: React.FC = () => {
  // Core state management
  const [appState, setAppState] = useState<AppState>(AppState.CHATTING);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completionTimestamp, setCompletionTimestamp] = useState<Date>(new Date());
  
  const { toast } = useToast();

  // Utility function to generate unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add message to chat history
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date()
    };

    console.log('ChatPage: Adding message', { role, contentLength: content.length, messageId: message.id });
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  // API call to chat backend
  const callChatAPI = async (message: string, epsLogContent?: string, testCaseContent?: string): Promise<ChatReply> => {
    console.log('ChatPage: Making API call', { message, hasEpsLog: !!epsLogContent, hasTestCase: !!testCaseContent });
    
    try {
      let prompt = message;
      if (epsLogContent && testCaseContent) {
        // Truncate inputs to avoid token limits
        const truncatedLog = truncateContent(epsLogContent);
        const truncatedTestCase = truncateContent(testCaseContent);
        // Construct EPS validation prompt
        prompt = buildEpsValidationPrompt(truncatedLog, truncatedTestCase);
      }

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemma3:1b",
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data?.message?.content || data?.content || "No reply from model";
      
      console.log('ChatPage: API reply received', { replyContentLength: reply.length });
      return {
        chatResponse: reply,
        stateUpdate: appState
      };
    } catch (error) {
      console.error('ChatPage: API call failed', error);
      throw error;
    }
  };

  // Handle sending messages
  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (isLoading) return;

    console.log('ChatPage: Processing user message', { 
      messageContent: messageContent.substring(0, 50),
      currentState: appState 
    });

    // Check for test case in message (e.g., JSON or XML-like content)
    const isTestCase = /{TestCaseID|StepNo\b|<StepNo/i.test(messageContent);
    if (isTestCase) {
      console.log('ChatPage: Test case detected in chat', { messageContent });
      addMessage('user', messageContent);
      addMessage('assistant', 'Test case detected. Please upload the corresponding EPS log file to proceed with validation.');
      setShowConfirmation(true);
      return;
    }

    // Add user message
    addMessage('user', messageContent);
    setIsLoading(true);

    try {
      const reply = await callChatAPI(messageContent);
      addMessage('assistant', reply.chatResponse);

      if (reply.stateUpdate && reply.stateUpdate !== appState) {
        console.log('ChatPage: State update received', { 
          from: appState, 
          to: reply.stateUpdate 
        });
      }

      toast({
        title: "Message sent",
        description: "EPS Agent has responded to your message.",
      });
    } catch (error) {
      console.error('ChatPage: Message handling failed', error);
      addMessage('assistant', 'Sorry, I encountered an error processing your message. Please try again.');
      toast({
        title: "Error",
        description: "Failed to send message. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, appState, addMessage, toast]);

  // Handle file confirmation
  const handleFileConfirmation = useCallback(async (data: EpsConfirmationData) => {
    console.log('ChatPage: File confirmation received', {
      fileName: data.pathToFile,
      logLength: data.epsLogContent.length,
      testCaseLength: data.testCaseContent.length
    });
    
    setCurrentFile(data.pathToFile);
    setShowConfirmation(false);
    setAppState(AppState.TASK_MODE);

    // Create a single validation task
    const validationTask: Task = {
      id: generateId(),
      description: 'Validate test case against EPS log',
      completed: false,
      epsLogContent: data.epsLogContent,
      testCaseContent: data.testCaseContent
    };

    setTasks([validationTask]);
    setCompletedTasksCount(0);

    // Add confirmation message to chat
    addMessage('assistant', `EPS log "${data.pathToFile}" and test case received. Initiating validation...`);

    // Process validation via API
    await processEpsValidation(validationTask);

    toast({
      title: "Validation started",
      description: `Validating test case for ${data.pathToFile}`,
    });
  }, [addMessage, toast]);

  // Process EPS validation via API
  const processEpsValidation = useCallback(async (task: Task) => {
    console.log('ChatPage: Starting EPS validation', { taskId: task.id });
    setIsLoading(true);

    try {
      const reply = await callChatAPI('', task.epsLogContent, task.testCaseContent);
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                completed: true,
                justification: reply.chatResponse,
                completedAt: new Date()
              }
            : t
        )
      );
      setCompletedTasksCount(1);
      setAppState(AppState.TASKS_COMPLETED);
      setCompletionTimestamp(new Date());

      addMessage('assistant', reply.chatResponse);
      toast({
        title: "Validation complete",
        description: "EPS log validation results are available.",
      });
    } catch (error) {
      console.error('ChatPage: Validation failed', error);
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                completed: true,
                justification: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                completedAt: new Date()
              }
            : t
        )
      );
      setCompletedTasksCount(1);
      setAppState(AppState.TASKS_COMPLETED);
      addMessage('assistant', 'Sorry, validation failed. Please check the log file and test case format.');
      toast({
        title: "Validation Error",
        description: "Failed to validate EPS log. Please check your inputs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, toast]);

  // Handle sidebar navigation
  const handleSidebarNavigation = useCallback((action: string) => {
    console.log('ChatPage: Sidebar navigation', { action, currentState: appState });
    
    switch (action) {
      case 'new-task':
        setShowConfirmation(true);
        break;
      case 'history':
        toast({
          title: "Message History",
          description: `You have ${messages.length} messages in your current session.`,
        });
        break;
      case 'request-feature':
        addMessage('assistant', 'I\'d be happy to help with feature requests! Please describe what functionality you\'d like to see added to the EPS Agent system.');
        break;
      case 'privacy':
        addMessage('assistant', 'Privacy Information: EPS Agent runs entirely on your local machine. All file processing, AI conversations, and data analysis happen locally. No data is sent to external servers, ensuring complete privacy and security of your documents.');
        break;
      default:
        console.warn('ChatPage: Unknown navigation action', { action });
    }
  }, [appState, messages.length, addMessage, toast]);

  // Handle starting new task from completion screen
  const handleStartNewTask = useCallback(() => {
    console.log('ChatPage: Starting new task from completion screen');
    
    setAppState(AppState.CHATTING);
    setTasks([]);
    setCompletedTasksCount(0);
    setCurrentFile('');
    setCompletionTimestamp(new Date());
    
    addMessage('assistant', 'Ready to start a new validation task! Please upload an EPS log file and paste your test case.');
    
    toast({
      title: "New Task Ready",
      description: "You can now upload a new EPS log file for validation.",
    });
  }, [addMessage, toast]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar
        currentState={appState}
        completedTasksCount={completedTasksCount}
        totalTasksCount={tasks.length}
        onNavigate={handleSidebarNavigation}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onTestCaseDetected={() => {
              console.log('ChatPage: Triggering file upload modal for test case');
              setShowConfirmation(true);
            }}
          />
        </div>

        {/* Right Panel - Conditional Content */}
        {(appState === AppState.TASK_MODE || appState === AppState.TASKS_COMPLETED) && (
          <div className="w-96 border-l bg-muted/20 p-4 overflow-y-auto">
            {appState === AppState.TASK_MODE && (
              <ShowListOfTasks
                tasks={tasks}
                fileName={currentFile}
                completedCount={completedTasksCount}
                isLoading={isLoading}
              />
            )}
            
            {appState === AppState.TASKS_COMPLETED && (
              <ShowCompletionAndJustification
                tasks={tasks}
                fileName={currentFile}
                completionTimestamp={completionTimestamp}
                onStartNewTask={handleStartNewTask}
              />
            )}
          </div>
        )}
      </div>

      {/* File Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <EpsConfirmation
            onConfirm={handleFileConfirmation}
            onCancel={() => {
              console.log('ChatPage: File confirmation cancelled');
              setShowConfirmation(false);
            }}
          />
        </div>
      )}
    </div>
  );
};