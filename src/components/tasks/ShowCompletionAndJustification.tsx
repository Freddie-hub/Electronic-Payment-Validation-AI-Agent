import React from 'react';
import { CheckCircle, FileText, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/chat';

interface ShowCompletionAndJustificationProps {
  tasks: Task[];
  fileName: string;
  completionTimestamp: Date;
  onStartNewTask: () => void;
}

/**
 * Component to display completed tasks with detailed justification
 * Shows final results and reasoning for task completion
 */
export const ShowCompletionAndJustification: React.FC<ShowCompletionAndJustificationProps> = ({
  tasks,
  fileName,
  completionTimestamp,
  onStartNewTask
}) => {
  const completedTasks = tasks.filter(task => task.completed);
  const totalProcessingTime = completionTimestamp.getTime() - tasks[0]?.completedAt?.getTime() || 0;

  // Log completion display
  React.useEffect(() => {
    console.log('ShowCompletionAndJustification: Displaying completion results', {
      fileName,
      completedTasksCount: completedTasks.length,
      totalTasks: tasks.length,
      completionTimestamp: completionTimestamp.toISOString()
    });
  }, [tasks, fileName, completionTimestamp]);

  return (
    <div className="space-y-6">
      {/* Completion Header */}
      <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Award className="w-6 h-6" />
            Processing Complete!
          </CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Completed at {completionTimestamp.toLocaleString()}</span>
            </div>
            <Badge variant="default" className="bg-success hover:bg-success/90">
              {completedTasks.length} Tasks Successfully Completed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Task Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Task Results & Justifications
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {completedTasks.map((task, index) => (
              <div key={task.id}>
                {/* Task header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        Task {index + 1}
                      </Badge>
                      {task.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {task.completedAt.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm mb-2">
                      {task.description}
                    </h4>
                  </div>
                </div>

                {/* Task justification */}
                {task.justification && (
                  <div className="ml-8 mb-4">
                    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-success">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                          Completion Details
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {task.justification}
                      </p>
                    </div>
                  </div>
                )}

                {/* Separator between tasks (except last) */}
                {index < completedTasks.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Processing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Tasks:</span>
              <span className="ml-2 font-medium">{tasks.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="ml-2 font-medium text-success">100%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Started:</span>
              <span className="ml-2 font-medium">
                {tasks[0]?.completedAt?.toLocaleTimeString() || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <span className="ml-2 font-medium">
                {completionTimestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={onStartNewTask} className="flex-1">
          Start New Task
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Export Results
        </Button>
      </div>
    </div>
  );
};