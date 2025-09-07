import React, { useState } from 'react';
import { Upload, FileText, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EpsConfirmationData } from '@/types/chat';

interface EpsConfirmationProps {
  onConfirm: (data: EpsConfirmationData) => void;
  onCancel: () => void;
}

/**
 * File submission and task confirmation component
 * Allows users to upload files and specify tasks to be performed
 */
export const EpsConfirmation: React.FC<EpsConfirmationProps> = ({
  onConfirm,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    pathToPdfCsvFile: '',
    tasksList: '',
    timestamp: new Date()
  });
  
  const [isValidating, setIsValidating] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const filePath = file.name; // In real app, this would be the actual path
      console.log('EpsConfirmation: File selected', { fileName: file.name, fileSize: file.size });
      
      setFormData(prev => ({
        ...prev,
        pathToPdfCsvFile: filePath
      }));
    }
  };

  // Handle tasks input change
  const handleTasksChange = (value: string) => {
    console.log('EpsConfirmation: Tasks updated', { tasksLength: value.length });
    setFormData(prev => ({
      ...prev,
      tasksList: value
    }));
  };

  // Validate and submit form
  const handleSubmit = () => {
    setIsValidating(true);
    console.log('EpsConfirmation: Validating form submission', formData);

    // Validate required fields
    if (!formData.pathToPdfCsvFile.trim()) {
      alert('Please select a file to process');
      setIsValidating(false);
      return;
    }

    if (!formData.tasksList.trim()) {
      alert('Please specify at least one task to be performed');
      setIsValidating(false);
      return;
    }

    // Parse tasks from textarea (split by lines, filter empty)
    const tasks = formData.tasksList
      .split('\n')
      .map(task => task.trim())
      .filter(task => task.length > 0);

    if (tasks.length === 0) {
      alert('Please specify valid tasks');
      setIsValidating(false);
      return;
    }

    const confirmationData: EpsConfirmationData = {
      pathToPdfCsvFile: formData.pathToPdfCsvFile,
      tasksToBeDone: tasks,
      timestamp: formData.timestamp
    };

    console.log('EpsConfirmation: Submitting confirmation data', confirmationData);
    onConfirm(confirmationData);
    setIsValidating(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          File Processing Confirmation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Select File (PDF/CSV)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
          {formData.pathToPdfCsvFile && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              <span>File selected: {formData.pathToPdfCsvFile}</span>
            </div>
          )}
        </div>

        {/* Tasks Input Section */}
        <div className="space-y-2">
          <Label htmlFor="tasks-input" className="text-sm font-medium">
            Tasks to be Performed
          </Label>
          <Textarea
            id="tasks-input"
            value={formData.tasksList}
            onChange={(e) => handleTasksChange(e.target.value)}
            placeholder="Enter tasks (one per line):&#10;- Extract data from tables&#10;- Generate summary report&#10;- Validate data accuracy"
            className="min-h-32 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Enter each task on a new line. These will be processed by the EPS Agent.
          </p>
        </div>

        {/* Timestamp Display */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Processing Timestamp</Label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formData.timestamp.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isValidating || !formData.pathToPdfCsvFile || !formData.tasksList.trim()}
            className="flex-1"
          >
            {isValidating ? 'Processing...' : 'Start Processing'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isValidating}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};