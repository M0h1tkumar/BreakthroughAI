import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Save, FileCheck, AlertTriangle } from 'lucide-react';
import { MedicalReport } from '@/types/medical';
import { aiCouncil } from '@/lib/aiCouncil';

interface MedicalReportEditorProps {
  report: MedicalReport;
  onSave: (report: MedicalReport) => void;
  onApprove: (report: MedicalReport) => void;
}

export function MedicalReportEditor({ report, onSave, onApprove }: MedicalReportEditorProps) {
  const [content, setContent] = useState(report.final_report);
  const [isLocked, setIsLocked] = useState(report.status === 'LOCKED');

  const handleSave = () => {
    const updatedReport: MedicalReport = {
      ...report,
      final_report: content,
      status: 'DRAFT'
    };
    onSave(updatedReport);
  };

  const handleApprove = () => {
    const approvedReport: MedicalReport = {
      ...report,
      final_report: content,
      status: 'DOCTOR_APPROVED',
      approved_at: new Date().toISOString(),
      compliance_disclaimer: aiCouncil.getComplianceDisclaimer()
    };
    setIsLocked(true);
    onApprove(approvedReport);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Medical Report
            <Badge variant={
              report.status === 'LOCKED' ? 'default' : 
              report.status === 'DOCTOR_APPROVED' ? 'secondary' : 
              'outline'
            }>
              {report.status.replace('_', ' ')}
            </Badge>
          </CardTitle>
          {isLocked && <Lock className="h-5 w-5 text-gray-500" />}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {report.ai_draft && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This report contains AI-assisted content. Review and modify as needed before approval.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <label className="text-sm font-medium">Report Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLocked}
            className="mt-1 min-h-[300px]"
            placeholder="Enter medical report content..."
          />
        </div>

        {!isLocked && (
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleApprove}>
              <FileCheck className="h-4 w-4 mr-2" />
              Approve & Lock
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
          <p className="font-medium mb-1">Compliance Notice:</p>
          <p>{aiCouncil.getComplianceDisclaimer()}</p>
          {report.approved_at && (
            <p className="mt-2">Approved on: {new Date(report.approved_at).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}