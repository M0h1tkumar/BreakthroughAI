import { AICouncilResponse, PatientData } from '@/types/medical';
import { authService } from './auth';
import { complianceService } from './compliance';
import { clinicalWorkflow } from './clinicalWorkflow';
import { swasthAI } from './swasthWorkflow';

const COMPLIANCE_DISCLAIMER = "This report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.";

class AICouncilService {
  async generateClinicalInsights(patientData: PatientData): Promise<AICouncilResponse> {
    // CRITICAL: Only doctors can access AI Council
    authService.requireDoctor();

    // Use Swasth AI workflow from JSON
    const symptoms = `${patientData.symptoms.join(', ')}. Medical history: ${patientData.medical_history}`;
    const workflowResult = await swasthAI.executeWorkflow({ symptoms });
    const response = swasthAI.generateAICouncilResponse(workflowResult);
    
    complianceService.logAIAccess(response);
    this.logAIUsage(response);
    
    return response;
  }

  private logAIUsage(response: AICouncilResponse): void {
    const user = authService.getCurrentUser();
    console.log('AI_AUDIT_LOG:', {
      doctor_id: user?.id,
      license: user?.licenseNumber,
      timestamp: response.timestamp,
      model: response.model_version,
      confidence: response.confidence_score
    });
  }

  async generateMedicalReport(patientData: PatientData, aiInsights?: AICouncilResponse): Promise<string> {
    authService.requireDoctor();
    
    let reportContent = `MEDICAL REPORT\n\nPatient ID: ${patientData.id}\nSymptoms: ${patientData.symptoms.join(', ')}\nMedical History: ${patientData.medical_history}\n\n`;
    
    if (aiInsights) {
      reportContent += `AI CLINICAL INSIGHTS:\n${aiInsights.insights.join('\n')}\n\n`;
      if (aiInsights.risk_flags.length > 0) {
        reportContent += `RISK FLAGS:\n${aiInsights.risk_flags.join('\n')}\n\n`;
      }
    }
    
    reportContent += `CLINICAL ASSESSMENT:\n[Doctor to complete]\n\nTREATMENT PLAN:\n[Doctor to complete]`;
    
    return complianceService.injectMedicalDisclaimer(reportContent);
  }

  getComplianceDisclaimer(): string {
    return COMPLIANCE_DISCLAIMER;
  }
}

export const aiCouncil = new AICouncilService();