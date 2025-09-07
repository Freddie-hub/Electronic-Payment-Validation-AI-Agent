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
  const callChatAPI = async (message: string): Promise<ChatReply> => {
    console.log('ChatPage: Making API call', { message });
    
    try {
      // // Since this is a Vite app, we'll need to proxy to the actual backend
      // // For now, we'll simulate the API response for demonstration
      
      // // Simulated delay
      // await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // // Simulated response based on message content
      // let simulatedResponse = '';
      
      // if (message.toLowerCase().includes('file') || message.toLowerCase().includes('upload')) {
      //   simulatedResponse = 'I can help you process files! Please use the "Start a New Task" option in the sidebar to upload a PDF or CSV file for processing.';
      // } else if (message.toLowerCase().includes('task')) {
      //   simulatedResponse = 'I\'m ready to help with task processing! Upload a file and I\'ll generate specific tasks based on its content and your requirements.';
      // } else if (message.toLowerCase().includes('privacy')) {
      //   simulatedResponse = 'All processing happens locally on your machine. Your files and conversations never leave your device, ensuring complete privacy and data security.';
      // } else {
      //   simulatedResponse = `I understand you said: "${message}". I'm EPS Agent, your local AI assistant for document processing and task automation. How can I help you today?`;
      // }

      // console.log('ChatPage: Simulated API response generated');

      // return {
      //   chatResponse: simulatedResponse,
      //   stateUpdate: appState
      // };
      
      
      // Actual API call code (uncomment when backend is ready):
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemma3:1b",
          messages: [{ role: "user", content: message }],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data?.message?.content || data?.content || "No reply from model";
      
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

    // Add user message
    addMessage('user', messageContent);
    setIsLoading(true);

    try {
      // Call API
      const reply = await callChatAPI(messageContent);
      // response takes time to come back
      // there is need to wait for it

      console.log('ChatPage: API reply received', { 
        replyContentLength: reply.chatResponse.length, 
        stateUpdate: reply.stateUpdate 
      });
      // Add assistant response
      addMessage('assistant', reply.chatResponse);

      // Process state updates if any
      if (reply.stateUpdate && reply.stateUpdate !== appState) {
        console.log('ChatPage: State update received', { 
          from: appState, 
          to: reply.stateUpdate 
        });
        // Handle state transitions based on backend response
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
  const handleFileConfirmation = useCallback((data: EpsConfirmationData) => {
    console.log('ChatPage: File confirmation received', data);
    
    setCurrentFile(data.pathToPdfCsvFile);
    setShowConfirmation(false);
    setAppState(AppState.TASK_MODE);

    // Generate tasks based on the confirmation data
    const generatedTasks: Task[] = data.tasksToBeDone.map((taskDescription, index) => ({
      id: generateId(),
      description: taskDescription,
      completed: false
    }));

    setTasks(generatedTasks);
    setCompletedTasksCount(0);

    // Add confirmation message to chat
    addMessage('assistant', `File "${data.pathToPdfCsvFile}" received. I've generated ${generatedTasks.length} tasks for processing. I'll now begin working on these tasks.`);

    // Simulate task processing (in real app, this would be handled by the backend)
    simulateTaskProcessing(generatedTasks);

    toast({
      title: "File processing started",
      description: `Processing ${generatedTasks.length} tasks for ${data.pathToPdfCsvFile}`,
    });
  }, [addMessage, toast]);

  // Simulate task processing (replace with real backend integration)
  const simulateTaskProcessing = useCallback((taskList: Task[]) => {
    console.log('ChatPage: Starting simulated task processing', { taskCount: taskList.length });
    
    taskList.forEach((task, index) => {
      setTimeout(() => {
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? { 
                  ...t, 
                  completed: true, 
                  justification: `Task "${task.description}" completed successfully. All requirements have been met and data has been processed according to specifications.`,
                  completedAt: new Date()
                }
              : t
          )
        );

        setCompletedTasksCount(prev => {
          const newCount = prev + 1;
          console.log('ChatPage: Task completed', { 
            taskId: task.id, 
            completedCount: newCount,
            totalTasks: taskList.length 
          });

          // Check if all tasks are completed
          if (newCount === taskList.length) {
            console.log('ChatPage: All tasks completed, transitioning to completion state');
            setTimeout(() => {
              setAppState(AppState.TASKS_COMPLETED);
              setCompletionTimestamp(new Date());
            }, 1000);
          }

          return newCount;
        });
      }, (index + 1) * 2000); // Simulate 2-second intervals
    });
  }, []);

  // Handle sidebar navigation
  const handleSidebarNavigation = useCallback((action: string) => {
    console.log('ChatPage: Sidebar navigation', { action, currentState: appState });
    
    switch (action) {
      case 'new-task':
        setShowConfirmation(true);
        break;
      case 'history':
        // Show message history (could open a modal or filter view)
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
    
    addMessage('assistant', 'Ready to start a new task! You can upload a new file or continue chatting.');
    
    toast({
      title: "New Task Ready",
      description: "You can now upload a new file for processing.",
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