import React from 'react';
import { CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/chat';

interface ShowListOfTasksProps {
  tasks: Task[];
  fileName: string;
  completedCount: number;
  isLoading?: boolean; // Added to show loading state
}

/**
 * Component to display the EPS validation task with progress status
 * Shows loading state and test case snippet during validation
 */
export const ShowListOfTasks: React.FC<ShowListOfTasksProps> = ({
  tasks,
  fileName,
  completedCount,
  isLoading = false
}) => {
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // Log task status updates
  React.useEffect(() => {
    console.log('ShowListOfTasks: Task status updated', {
      totalTasks,
      completedCount,
      progressPercentage: Math.round(progressPercentage),
      isLoading
    });
  }, [completedCount, totalTasks, progressPercentage, isLoading]);

  // Truncate test case content for display
  const truncateContent = (content: string | undefined, maxLength: number = 100) => {
    if (!content) return 'N/A';
    return content.length > maxLength ? `${content.slice(0, maxLength)}...` : content;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            EPS Log Validation
          </CardTitle>
          <Badge variant={completedCount === totalTasks ? "default" : "secondary"}>
            {completedCount}/{totalTasks} Complete
          </Badge>
        </div>
        
        {/* File name display */}
        <div className="text-sm text-muted-foreground">
          Processing: <span className="font-medium">{fileName}</span>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={isLoading ? undefined : progressPercentage} className="w-full" />
          <div className="text-xs text-muted-foreground text-center">
            {isLoading ? 'Validating...' : `${Math.round(progressPercentage)}% Complete`}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tasks generated yet...</p>
              <p className="text-sm">The EPS Agent is preparing to validate your file.</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  task.completed
                    ? 'bg-task-completed border-task-completed-foreground/20'
                    : 'bg-task-pending border-task-pending-foreground/20'
                }`}
              >
                {/* Task status icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )
                  )}
                </div>

                {/* Task content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Task {index + 1}
                    </span>
                    {task.completed && task.completedAt && (
                      <span className="text-xs text-success">
                        Completed at {task.completedAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm ${task.completed ? 'line-through opacity-75' : ''}`}>
                    {task.description}
                  </p>
                  
                  {/* Show test case snippet */}
                  {task.testCaseContent && (
                    <div className="mt-2 p-2 bg-muted/20 rounded border-l-2 border-primary">
                      <p className="text-xs text-primary-foreground font-medium">
                        Test Case Snippet:
                      </p>
                      <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                        {truncateContent(task.testCaseContent)}
                      </p>
                    </div>
                  )}

                  {/* Show justification if task is completed */}
                  {task.completed && task.justification && (
                    <div className="mt-2 p-2 bg-success/10 rounded border-l-2 border-success">
                      <p className="text-xs text-success-foreground font-medium">
                        Result:
                      </p>
                      <p className="text-xs text-success-foreground/80 whitespace-pre-wrap">
                        {task.justification}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary footer */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Validation Status
              </span>
              <span className={`font-medium ${
                completedCount === totalTasks ? 'text-success' : 'text-warning'
              }`}>
                {completedCount === totalTasks 
                  ? 'Validation completed!' 
                  : 'Validation in progress...'
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};