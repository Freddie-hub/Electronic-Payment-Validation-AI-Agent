# EPS Agent - Component Documentation

## Overview
EPS Agent is a local AI-powered document processing and task automation system built with React, TypeScript, and Tailwind CSS. The system provides a chat interface for interacting with a local AI backend and includes comprehensive task management capabilities.

## Component Architecture

### Core Components

#### `/chat/ChatInterface.tsx`
- **Purpose**: Main chat interface for user-agent communication
- **Features**: Message history, real-time input, auto-scrolling, loading states
- **Props**: `messages`, `onSendMessage`, `isLoading`
- **Logging**: Verbose console logging for all message operations and state changes

#### `/chat/EpsConfirmation.tsx`
- **Purpose**: File upload and task specification component
- **Interface**: 
  ```typescript
  interface EpsConfirmationData {
    pathToPdfCsvFile: string;
    tasksToBeDone: string[];
    timestamp: Date;
  }
  ```
- **Features**: File validation, task input parsing, form validation
- **Props**: `onConfirm`, `onCancel`

#### `/tasks/ShowListOfTasks.tsx`
- **Purpose**: Display active tasks with progress tracking
- **Features**: Progress bar, task status indicators, completion tracking
- **Props**: `tasks`, `fileName`, `completedCount`
- **State Tracking**: Monitors task completion count and updates UI accordingly

#### `/tasks/ShowCompletionAndJustification.tsx`
- **Purpose**: Display completed tasks with detailed justifications
- **Features**: Task summaries, completion timestamps, export options
- **Props**: `tasks`, `fileName`, `completionTimestamp`, `onStartNewTask`

#### `/navigation/Sidebar.tsx`
- **Purpose**: Navigation and status display
- **Features**: Current state display, task progress, navigation actions
- **Menu Items**: History, Start New Task, Request Feature, Privacy
- **Props**: `currentState`, `completedTasksCount`, `totalTasksCount`, `onNavigate`

### Main Page Component

#### `/pages/ChatPage.tsx`
- **Purpose**: Main orchestration component managing all application states
- **State Management**: Handles transitions between chatting, task processing, and completion modes
- **API Integration**: Simulated local backend communication (ready for real backend integration)
- **Chat Reply Interface**:
  ```typescript
  interface ChatReply {
    chatResponse: string;
    stateUpdate: string;
  }
  ```

## Application States

1. **CHATTING**: General conversation mode with sidebar navigation
2. **TASK_MODE**: File processing with task list display on right panel
3. **TASKS_COMPLETED**: Completion view with detailed justifications

## State Management

### Task Completion Tracking
- State variable tracks completed task count
- Automatic state transition when all tasks complete
- Verbose console logging for all state changes

### Message History
- Complete conversation persistence during session
- Timestamp tracking for all messages
- Auto-scroll to latest messages

## Backend Integration

### API Structure
The system expects a local backend at `http://localhost:11434/api/chat` with the following structure:

```typescript
// Request format
{
  message: string
}

// Response format  
{
  reply: string,
  error?: string
}
```

### Ollama Integration
The backend should use the Gemma 3:1b model as specified in the provided Next.js route example.

## Logging & Debugging

All components include comprehensive console logging:
- State transitions
- User interactions  
- API calls and responses
- Task completion updates
- Navigation actions

## Design System

### Color Scheme
- Professional blue/gray theme with HSL color system
- Custom task status colors (pending/completed)
- Chat bubble differentiation (user/assistant)
- Success, warning, and error states

### Responsive Design
- Sidebar navigation (264px width)
- Flexible main content area
- Right panel for task views (384px width)
- Mobile-responsive chat interface

## Usage Instructions

1. **Start Conversation**: Use main chat interface for general AI interaction
2. **Upload File**: Click "Start a New Task" in sidebar to upload PDF/CSV
3. **Specify Tasks**: Define tasks to be performed on the uploaded file
4. **Monitor Progress**: Watch task completion in real-time on right panel
5. **View Results**: Review detailed justifications when all tasks complete

## Development Notes

- Modular component architecture for easy maintenance
- TypeScript interfaces for type safety
- Comprehensive error handling and user feedback
- Ready for production backend integration
- Local-first privacy approach (no external data transmission)