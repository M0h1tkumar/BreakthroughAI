import { OpenAIProvider, GoogleProvider, PerplexityProvider } from './aiProviders';
import { authService } from './auth';
import { complianceService } from './compliance';

interface PIIData {
  anonymizedSymptoms: string;
  extractedPII: Record<string, string[]>;
  originalSymptoms: string;
}

class ClinicalWorkflowService {
  private openai = new OpenAIProvider();
  private google = new GoogleProvider();
  private perplexity = new PerplexityProvider();

  private separatePII(symptoms: string): PIIData {
    const piiPatterns = {
      name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      phone: /\b\d{3}-\d{3}-\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      dob: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g
    };

    let anonymizedText = symptoms;
    const extractedPII: Record<string, string[]> = {};

    Object.entries(piiPatterns).forEach(([type, pattern]) => {
      const matches = symptoms.match(pattern);
      if (matches) {
        extractedPII[type] = matches;
        matches.forEach((match, index) => {
          anonymizedText = anonymizedText.replace(match, `[${type.toUpperCase()}_${index + 1}]`);
        });
      }
    });

    return {
      anonymizedSymptoms: anonymizedText,
      extractedPII,
      originalSymptoms: symptoms
    };
  }

  async processPatientSymptoms(symptoms: string) {
    // Enforce doctor-only access
    complianceService.enforceAIAccess();

    // Step 1: PII Separation
    const piiData = this.separatePII(symptoms);

    // Step 2: Parallel AI Council Processing
    const [diagnosisResult, riskResult] = await Promise.all([
      this.openai.generateDifferentialDiagnosis(piiData.anonymizedSymptoms),
      this.google.assessRisk(piiData.anonymizedSymptoms)
    ]);

    // Step 3: Extract AI responses
    const diagnosisData = JSON.parse(diagnosisResult.choices[0].message.content);
    const riskData = JSON.parse(riskResult.candidates[0].content.parts[0].text);

    // Step 4: Final synthesis
    const finalReport = await this.perplexity.synthesizeReport(diagnosisData, riskData, {});

    // Step 5: Compliance logging
    const aiResponse = {
      generated_by: 'AI Council' as const,
      purpose: 'Clinical decision support' as const,
      medical_disclaimer: 'Not a diagnosis. Doctor interpretation required.' as const,
      confidence_score: this.calculateOverallConfidence(diagnosisData, riskData),
      insights: this.extractInsights(diagnosisData, riskData),
      risk_flags: riskData.redFlags?.map((flag: any) => flag.flag) || [],
      timestamp: new Date().toISOString(),
      model_version: 'swasth-ai-v1.0'
    };

    complianceService.logAIAccess(aiResponse);

    return {
      aiResponse,
      clinicalData: {
        differentialDiagnoses: diagnosisData.differentialDiagnoses,
        riskAssessment: riskData,
        finalSynthesis: finalReport.choices[0].message.content
      },
      piiData
    };
  }

  private calculateOverallConfidence(diagnosisData: any, riskData: any): number {
    const avgDiagnosisConfidence = diagnosisData.differentialDiagnoses?.reduce(
      (sum: number, d: any) => sum + d.confidenceScore, 0
    ) / (diagnosisData.differentialDiagnoses?.length || 1);
    
    const riskWeight = riskData.triageLevel === 'HIGH' ? 0.9 : 
                     riskData.triageLevel === 'MEDIUM' ? 0.7 : 0.5;
    
    return Math.min(0.95, (avgDiagnosisConfidence + riskWeight) / 2);
  }

  private extractInsights(diagnosisData: any, riskData: any): string[] {
    const insights = [];
    
    if (diagnosisData.differentialDiagnoses?.length > 0) {
      insights.push(`Top diagnosis: ${diagnosisData.differentialDiagnoses[0].diagnosis}`);
    }
    
    if (riskData.triageLevel) {
      insights.push(`Triage level: ${riskData.triageLevel}`);
    }
    
    if (riskData.specialtyReferral && riskData.specialtyReferral !== 'null') {
      insights.push(`Referral recommended: ${riskData.specialtyReferral}`);
    }
    
    return insights;
  }
}

export const clinicalWorkflow = new ClinicalWorkflowService();