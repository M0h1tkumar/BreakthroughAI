import { authService } from './auth';
import { AICouncilResponse, MedicalReport } from '@/types/medical';

class ComplianceService {
  private auditLog: Array<{
    timestamp: string;
    user_id: string;
    action: string;
    resource: string;
    details: any;
  }> = [];

  logAIAccess(response: AICouncilResponse): void {
    const user = authService.getCurrentUser();
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      user_id: user?.id || 'unknown',
      action: 'AI_COUNCIL_ACCESS',
      resource: 'clinical_insights',
      details: {
        license_number: user?.licenseNumber,
        model_version: response.model_version,
        confidence_score: response.confidence_score
      }
    });
  }

  logReportGeneration(report: MedicalReport): void {
    const user = authService.getCurrentUser();
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      user_id: user?.id || 'unknown',
      action: 'REPORT_GENERATED',
      resource: `report_${report.id}`,
      details: {
        patient_id: report.patient_id,
        ai_assisted: !!report.ai_draft,
        status: report.status
      }
    });
  }

  enforceAIAccess(): void {
    if (!authService.isDoctor()) {
      throw new Error('COMPLIANCE_VIOLATION: AI access restricted to licensed doctors only');
    }
  }

  injectMedicalDisclaimer(content: string): string {
    const disclaimer = "\n\n--- MEDICAL DISCLAIMER ---\nThis report contains AI-generated insights. Final medical interpretation and decisions must be made by a licensed doctor.";
    return content + disclaimer;
  }

  validateReportApproval(report: MedicalReport): boolean {
    const user = authService.getCurrentUser();
    return user?.role === 'DOCTOR' && !!user.licenseNumber;
  }

  getAuditTrail(): Array<any> {
    // Only doctors can access audit logs
    this.enforceAIAccess();
    return this.auditLog;
  }
}

export const complianceService = new ComplianceService();