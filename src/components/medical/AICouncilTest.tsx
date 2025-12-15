import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TestTube } from 'lucide-react';
import { swasthAI } from '@/lib/swasthWorkflow';
import { authService } from '@/lib/auth';

export function AICouncilTest() {
  const [symptoms, setSymptoms] = useState('Patient has chest pain, shortness of breath, and fatigue for 2 days');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAICouncil = async () => {
    if (!authService.isDoctor()) {
      alert('Doctor access required for AI Council');
      return;
    }

    setLoading(true);
    try {
      const workflowResult = await swasthAI.executeWorkflow({ symptoms });
      const aiResponse = swasthAI.generateAICouncilResponse(workflowResult);
      setResult({ aiResponse, workflowResult });
    } catch (error) {
      console.error('AI Council test failed:', error);
      alert('AI Council test failed - check console for details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          AI Council Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Test Symptoms</label>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Enter patient symptoms..."
            className="mt-1"
          />
        </div>

        <Button onClick={testAICouncil} disabled={loading} className="w-full">
          <Brain className="h-4 w-4 mr-2" />
          {loading ? 'Processing...' : 'Test AI Council'}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Confidence: {(result.aiResponse.confidence_score * 100).toFixed(0)}%
              </Badge>
              <Badge variant="outline">
                {result.aiResponse.model_version}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">AI Insights</h4>
              <ul className="text-sm space-y-1">
                {result.aiResponse.insights.map((insight: string, index: number) => (
                  <li key={index} className="p-2 bg-gray-50 rounded">• {insight}</li>
                ))}
              </ul>
            </div>

            {result.aiResponse.risk_flags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Risk Flags</h4>
                <div className="space-y-1">
                  {result.aiResponse.risk_flags.map((flag: string, index: number) => (
                    <Badge key={index} variant="destructive" className="mr-2">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.aiResponse.workflow_data && (
              <div>
                <h4 className="font-medium mb-2">Differential Diagnoses</h4>
                <div className="space-y-2">
                  {result.aiResponse.workflow_data.differential_diagnoses.slice(0, 3).map((diagnosis: any, index: number) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium">{diagnosis.diagnosis}</span>
                      <span className="text-blue-600 ml-2">({(diagnosis.confidenceScore * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Generated: {new Date(result.aiResponse.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}