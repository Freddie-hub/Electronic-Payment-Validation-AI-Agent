import React, { useState } from 'react';
import { CheckCircle, FileText, Clock, Award, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface ShowCompletionAndJustificationProps {
  tasks: Task[];
  fileName: string;
  completionTimestamp: Date;
  onStartNewTask: () => void;
}

/**
 * Component to display completed EPS validation task with detailed justification
 * Shows PASS/FAIL result, reasoning, evidence, and raw log/test case content
 */
export const ShowCompletionAndJustification: React.FC<ShowCompletionAndJustificationProps> = ({
  tasks,
  fileName,
  completionTimestamp,
  onStartNewTask
}) => {
  const { toast } = useToast();
  const completedTasks = tasks.filter(task => task.completed);
  const totalProcessingTime = completionTimestamp.getTime() - tasks[0]?.completedAt?.getTime() || 0;
  const [showLogContent, setShowLogContent] = useState(false);
  const [showTestCaseContent, setShowTestCaseContent] = useState(false);

  // Log completion display
  React.useEffect(() => {
    console.log('ShowCompletionAndJustification: Displaying completion results', {
      fileName,
      completedTasksCount: completedTasks.length,
      totalTasks: tasks.length,
      completionTimestamp: completionTimestamp.toISOString(),
      justificationLength: completedTasks[0]?.justification?.length || 0
    });
  }, [tasks, fileName, completionTimestamp]);

  // Extract result from justification (assuming model outputs "Overall Result: PASS/FAIL")
  const task = completedTasks[0];
  const overallResult = task?.justification?.match(/Overall Result:\s*(PASS|FAIL)/i)?.[1] || 'Unknown';
  const reasoningAndEvidence = task?.justification?.split('Reasoning and Evidence:')[1]?.trim() || task?.justification || 'No justification provided';

  // Handle export results as .md
  const handleExportResults = () => {
    const content = `# EPS Validation Results\n\n**File:** ${fileName}\n**Completed At:** ${completionTimestamp.toLocaleString()}\n\n## Task: ${task?.description}\n\n**Overall Result:** ${overallResult}\n\n**Reasoning and Evidence:**\n${reasoningAndEvidence}\n\n**Raw EPS Log Content:**\n${task?.epsLogContent || 'N/A'}\n\n**Test Case Content:**\n${task?.testCaseContent || 'N/A'}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eps_validation_${fileName}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('ShowCompletionAndJustification: Exported results', { fileName });
    toast({
      title: 'Results Exported',
      description: 'Validation results saved as Markdown file.',
    });
  };

  // Handle copy to clipboard
  const handleCopyResults = () => {
    const content = `EPS Validation Results\nFile: ${fileName}\nCompleted At: ${completionTimestamp.toLocaleString()}\nTask: ${task?.description}\nOverall Result: ${overallResult}\nReasoning and Evidence:\n${reasoningAndEvidence}`;
    navigator.clipboard.writeText(content);
    console.log('ShowCompletionAndJustification: Copied results to clipboard', { fileName });
    toast({
      title: 'Results Copied',
      description: 'Validation results copied to clipboard.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Completion Header */}
      <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Award className="w-6 h-6" />
            Validation Complete!
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
            <Badge variant="default" className={overallResult === 'PASS' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}>
              Result: {overallResult}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Task Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Validation Details
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
                        <Badge variant="outline" className={`text-xs ${overallResult === 'PASS' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                          Result: {overallResult}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {reasoningAndEvidence}
                      </p>
                    </div>
                  </div>
                )}

                {/* Collapsible Raw EPS Log Content */}
                {task.epsLogContent && (
                  <div className="ml-8 mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowLogContent(!showLogContent)}
                      className="flex items-center gap-2 text-sm"
                    >
                      {showLogContent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Raw EPS Log Content
                    </Button>
                    {showLogContent && (
                      <div className="mt-2 p-4 bg-muted/20 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap">
                          {task.epsLogContent}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsible Test Case Content */}
                {task.testCaseContent && (
                  <div className="ml-8 mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowTestCaseContent(!showTestCaseContent)}
                      className="flex items-center gap-2 text-sm"
                    >
                      {showTestCaseContent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Test Case Content
                    </Button>
                    {showTestCaseContent && (
                      <div className="mt-2 p-4 bg-muted/20 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap">
                          {task.testCaseContent}
                        </pre>
                      </div>
                    )}
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
          <CardTitle className="text-sm">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Tasks:</span>
              <span className="ml-2 font-medium">{tasks.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Result:</span>
              <span className={`ml-2 font-medium ${overallResult === 'PASS' ? 'text-success' : 'text-destructive'}`}>
                {overallResult}
              </span>
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
          Start New Validation
        </Button>
        <Button variant="outline" onClick={handleCopyResults}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Results
        </Button>
        <Button variant="outline" onClick={handleExportResults}>
          Export as Markdown
        </Button>
      </div>
    </div>
  );
};