import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Activity, AlertTriangle, Stethoscope } from 'lucide-react';

interface ClinicalData {
  differentialDiagnoses?: Array<{
    diagnosis: string;
    confidenceScore: number;
    supportingEvidence: string[];
    additionalTests: string[];
  }>;
  riskAssessment?: {
    triageLevel: string;
    redFlags: Array<{ flag: string; severity: string; action: string }>;
    timeToTreatment: string;
    specialtyReferral?: string;
  };
}

interface ClinicalInsightsPanelProps {
  clinicalData?: ClinicalData;
  isVisible: boolean;
}

export function ClinicalInsightsPanel({ clinicalData, isVisible }: ClinicalInsightsPanelProps) {
  if (!isVisible || !clinicalData) return null;

  return (
    <div className="space-y-4">
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          AI Council Analysis - Doctor Review Required
        </AlertDescription>
      </Alert>

      {clinicalData.differentialDiagnoses && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Differential Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinicalData.differentialDiagnoses.slice(0, 3).map((diagnosis, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{diagnosis.diagnosis}</span>
                    <Badge variant="secondary">
                      {(diagnosis.confidenceScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Evidence: {diagnosis.supportingEvidence?.join(', ')}
                  </p>
                  {diagnosis.additionalTests?.length > 0 && (
                    <p className="text-xs text-blue-600">
                      Tests: {diagnosis.additionalTests.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {clinicalData.riskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Triage Level</span>
                <Badge variant={
                  clinicalData.riskAssessment.triageLevel === 'HIGH' ? 'destructive' :
                  clinicalData.riskAssessment.triageLevel === 'MEDIUM' ? 'default' : 'secondary'
                }>
                  {clinicalData.riskAssessment.triageLevel}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Time to Treatment</span>
                <span className="text-sm font-medium">{clinicalData.riskAssessment.timeToTreatment}</span>
              </div>

              {clinicalData.riskAssessment.specialtyReferral && 
               clinicalData.riskAssessment.specialtyReferral !== 'null' && (
                <div className="flex items-center justify-between">
                  <span>Referral</span>
                  <Badge variant="outline">{clinicalData.riskAssessment.specialtyReferral}</Badge>
                </div>
              )}

              {clinicalData.riskAssessment.redFlags?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Red Flags
                  </h4>
                  <div className="space-y-1">
                    {clinicalData.riskAssessment.redFlags.map((flag, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                        <span className="font-medium">{flag.flag}</span>
                        <span className="text-red-600 ml-2">({flag.severity})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}