import React from 'react';
import { MessageSquare, FileText, Plus, HelpCircle, Shield, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AppState } from '@/types/chat';

interface SidebarProps {
  currentState: AppState;
  completedTasksCount: number;
  totalTasksCount: number;
  onNavigate: (action: string) => void;
}

/**
 * Navigation sidebar component
 * Provides access to different app modes and utilities
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentState,
  completedTasksCount,
  totalTasksCount,
  onNavigate
}) => {
  // Navigation items configuration
  const navigationItems = [
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'View conversation history',
      action: () => onNavigate('history')
    },
    {
      id: 'new-task',
      label: 'Start a New Task',
      icon: Plus,
      description: 'Upload file and begin processing',
      action: () => onNavigate('new-task')
    },
    {
      id: 'request-feature',
      label: 'Request a Feature',
      icon: HelpCircle,
      description: 'Suggest improvements or new features',
      action: () => onNavigate('request-feature')
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Shield,
      description: 'Local processing information',
      action: () => onNavigate('privacy')
    }
  ];

  // Log navigation actions
  const handleNavigation = (item: typeof navigationItems[0]) => {
    console.log('Sidebar: Navigation action triggered', { 
      itemId: item.id, 
      currentState,
      action: item.label 
    });
    item.action();
  };

  return (
    <div className="w-64 bg-gradient-to-b from-background to-muted/20 border-r h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-lg">EPS Agent</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Local AI Task Processing
        </p>
      </div>

      {/* Current Status */}
      <div className="p-4">
        <Card className="bg-card/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Status</span>
              <Badge 
                variant={currentState === AppState.CHATTING ? 'secondary' : 'default'}
                className="text-xs"
              >
                {currentState.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            {/* Task progress indicator */}
            {currentState !== AppState.CHATTING && totalTasksCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3" />
                  <span>Tasks: {completedTasksCount}/{totalTasksCount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-3 text-left"
              onClick={() => handleNavigation(item)}
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            <span>100% Local Processing</span>
          </div>
          <p>Your data never leaves your device</p>
        </div>
      </div>
    </div>
  );
};