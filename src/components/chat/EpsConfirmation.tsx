import React, { useState } from 'react';
import { Upload, FileText, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EpsConfirmationData } from '@/types/chat';
import { readFileAsText } from '@/lib/epsUtils';

interface EpsConfirmationProps {
  onConfirm: (data: EpsConfirmationData) => void;
  onCancel: () => void;
}

/**
 * File submission and test case confirmation component
 * Allows users to upload EPS log files and specify a test case for validation
 */
export const EpsConfirmation: React.FC<EpsConfirmationProps> = ({
  onConfirm,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    pathToFile: '',
    epsLogContent: '',
    testCaseContent: '',
    timestamp: new Date()
  });
  
  const [isValidating, setIsValidating] = useState(false);

  // Handle file selection and read content as text
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('EpsConfirmation: File selected', { fileName: file.name, fileSize: file.size });
      try {
        const content = await readFileAsText(file); // Use utility function
        setFormData(prev => ({
          ...prev,
          pathToFile: file.name,
          epsLogContent: content
        }));
      } catch (error) {
        console.error('EpsConfirmation: Failed to read file', { fileName: file.name, error });
        alert(error instanceof Error ? error.message : 'Failed to read the file.');
      }
    }
  };

  // Handle test case input change
  const handleTestCaseChange = (value: string) => {
    console.log('EpsConfirmation: Test case updated', { testCaseLength: value.length });
    setFormData(prev => ({
      ...prev,
      testCaseContent: value
    }));
  };

  // Validate and submit form
  const handleSubmit = () => {
    setIsValidating(true);
    console.log('EpsConfirmation: Validating form submission', formData);

    // Validate required fields
    if (!formData.pathToFile.trim() || !formData.epsLogContent.trim()) {
      alert('Please select a valid EPS log file to process');
      setIsValidating(false);
      return;
    }

    if (!formData.testCaseContent.trim()) {
      alert('Please paste a valid test case to validate against');
      setIsValidating(false);
      return;
    }

    const confirmationData: EpsConfirmationData = {
      pathToFile: formData.pathToFile,
      epsLogContent: formData.epsLogContent,
      testCaseContent: formData.testCaseContent,
      tasksToBeDone: ['Validate test case against EPS log'],
      timestamp: formData.timestamp
    };

    console.log('EpsConfirmation: Submitting confirmation data', {
      fileName: confirmationData.pathToFile,
      logLength: confirmationData.epsLogContent.length,
      testCaseLength: confirmationData.testCaseContent.length
    });
    onConfirm(confirmationData);
    setIsValidating(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          EPS Log Validation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Upload EPS Log File
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".log,.xml,.txt,.json,.pdf"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
          {formData.pathToFile && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              <span>File selected: {formData.pathToFile}</span>
            </div>
          )}
        </div>

        {/* Test Case Input Section */}
        <div className="space-y-2">
          <Label htmlFor="test-case-input" className="text-sm font-medium">
            Paste Test Case
          </Label>
          <Textarea
            id="test-case-input"
            value={formData.testCaseContent}
            onChange={(e) => handleTestCaseChange(e.target.value)}
            placeholder="Paste your test case here (e.g., JSON or plain text describing test steps)"
            className="min-h-32 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Enter the test case to validate against the EPS log. Ensure it includes all necessary steps.
          </p>
        </div>

        {/* Timestamp Display */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Submission Timestamp</Label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formData.timestamp.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isValidating || !formData.pathToFile || !formData.epsLogContent.trim() || !formData.testCaseContent.trim()}
            className="flex-1"
          >
            {isValidating ? 'Processing...' : 'Start Validation'}
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