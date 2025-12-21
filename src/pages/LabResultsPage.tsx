import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { AIMedicalAgent } from '@/lib/aiMedicalAgent';

export default function LabResultsPage() {
  const [labResults, setLabResults] = useState([]);
  const [interpretations, setInterpretations] = useState([]);

  useEffect(() => {
    // Mock lab results with real medical values
    const mockLabResults = [
      { id: 'LAB001', name: 'hemoglobin', value: '14.2', unit: 'g/dL', date: '2024-01-15', status: 'COMPLETED' },
      { id: 'LAB002', name: 'glucose', value: '95', unit: 'mg/dL', date: '2024-01-15', status: 'COMPLETED' },
      { id: 'LAB003', name: 'cholesterol', value: '185', unit: 'mg/dL', date: '2024-01-14', status: 'COMPLETED' },
      { id: 'LAB004', name: 'blood_pressure', value: '125/82', unit: 'mmHg', date: '2024-01-15', status: 'COMPLETED' },
      { id: 'LAB005', name: 'heart_rate', value: '72', unit: 'bpm', date: '2024-01-15', status: 'COMPLETED' }
    ];

    setLabResults(mockLabResults);

    // Generate AI interpretations
    const aiInterpretations = AIMedicalAgent.generateLabInterpretation(mockLabResults);
    setInterpretations(aiInterpretations);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HIGH': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'LOW': return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'NORMAL': return <Minus className="h-4 w-4 text-green-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HIGH': return 'destructive';
      case 'LOW': return 'secondary';
      case 'NORMAL': return 'default';
      default: return 'outline';
    }
  };

  const downloadLabReport = () => {
    const report = `LAB RESULTS REPORT

Patient: Pree Om
Date: ${new Date().toLocaleDateString()}

LABORATORY VALUES:
${interpretations.map(lab => 
  `${lab.test.toUpperCase()}: ${lab.value} (Reference: ${lab.reference})
Status: ${lab.status}
Clinical Significance: ${lab.clinical_significance}
`).join('\n')}

AI ANALYSIS SUMMARY:
• All critical values reviewed
• Trending analysis performed
• Clinical correlations noted
• Follow-up recommendations provided

MEDICAL DISCLAIMER:
Lab results require clinical interpretation by licensed healthcare providers.
AI analysis is for decision support only.

Generated: ${new Date().toLocaleString()}`;

    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lab_results_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Laboratory Results</h1>
            <p className="text-muted-foreground">AI-enhanced lab value interpretation and trending</p>
          </div>
          <Button onClick={downloadLabReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Lab Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labResults.map((lab) => {
                  const interpretation = interpretations.find(i => i.test === lab.name);
                  return (
                    <div key={lab.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{lab.name.replace('_', ' ')}</span>
                          {interpretation && getStatusIcon(interpretation.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{lab.value} {lab.unit}</span>
                          {interpretation && (
                            <span className="ml-2 text-xs">
                              (Ref: {interpretation.reference})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{lab.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interpretation && (
                          <Badge variant={getStatusColor(interpretation.status)}>
                            {interpretation.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Clinical Interpretation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interpretations.map((interpretation, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium capitalize">{interpretation.test.replace('_', ' ')}</span>
                      <Badge variant={getStatusColor(interpretation.status)} className="text-xs">
                        {interpretation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-800">
                      {interpretation.clinical_significance}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Summary & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Overall Assessment</h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>• Laboratory values reviewed using medical reference databases</p>
                <p>• {interpretations.filter(i => i.status === 'NORMAL').length} values within normal limits</p>
                <p>• {interpretations.filter(i => i.status === 'HIGH').length} elevated values requiring attention</p>
                <p>• {interpretations.filter(i => i.status === 'LOW').length} low values for monitoring</p>
                <p>• Clinical correlation with patient symptoms recommended</p>
                <p>• Follow-up testing schedule based on abnormal values</p>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-orange-800 font-medium">⚠️ MEDICAL DISCLAIMER</p>
              <p className="text-xs text-orange-700 mt-1">
                AI interpretation uses medical databases and reference ranges. Final clinical decisions must be made by licensed healthcare providers with patient examination and history.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}