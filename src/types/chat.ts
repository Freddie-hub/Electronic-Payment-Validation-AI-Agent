/**
 * Core interfaces for the EPS Agent Chat System
 * All interfaces with detailed TypeScript definitions
 */

// Interface for file confirmation component
export interface EpsConfirmationData {
  pathToPdfCsvFile: string;
  tasksToBeDone: string[];
  timestamp: Date;
}

// Interface for chat agent responses
export interface ChatReply {
  chatResponse: string;
  stateUpdate: string;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Task interface with completion tracking
export interface Task {
  id: string;
  description: string;
  completed: boolean;
  justification?: string;
  completedAt?: Date;
}

// Application state enum
export enum AppState {
  CHATTING = 'chatting',
  TASK_MODE = 'task_mode', 
  TASKS_COMPLETED = 'tasks_completed'
}

// Navigation item interface for sidebar
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

// API response interface
export interface ApiResponse {
  reply: string;
  error?: string;
}