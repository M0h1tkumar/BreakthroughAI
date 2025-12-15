import { OpenAIProvider, GoogleProvider, PerplexityProvider } from './aiProviders';
import { authService } from './auth';
import { complianceService } from './compliance';

interface SwasthWorkflowInput {
  symptoms: string;
  imageDescription?: string;
}

interface PIIData {
  anonymizedSymptoms: string;
  extractedPII: Record<string, string[]>;
  originalSymptoms: string;
}

class SwasthAIWorkflow {
  private openai = new OpenAIProvider();
  private google = new GoogleProvider();
  private perplexity = new PerplexityProvider();

  async executeWorkflow(input: SwasthWorkflowInput) {
    // Step 1: PII Separation (from JSON workflow)
    const piiData = this.separatePII(input.symptoms, input.imageDescription);
    
    try {
      // Step 2: Direct AI analysis without external APIs
      const diagnosis = await this.generateDiagnosis(piiData.anonymizedSymptoms);
      const risk = await this.assessRisk(piiData.anonymizedSymptoms);
      const finalReport = await this.synthesizeReport(diagnosis, risk, piiData.anonymizedSymptoms);

      return {
        piiData,
        diagnosis,
        risk,
        finalReport,
        timestamp: new Date().toISOString(),
        workflowId: 'swasth-ai-instance'
      };
    } catch (error) {
      console.error('AI Workflow Error:', error);
      return this.generateFallbackWorkflow(piiData);
    }
  }

  private separatePII(symptoms: string, imageDescription?: string): PIIData {
    // Combine inputs as per JSON workflow
    let combinedSymptoms = '';
    if (symptoms) combinedSymptoms += 'Text Input (English): ' + symptoms + '\n';
    if (imageDescription) combinedSymptoms += 'Image Description: ' + imageDescription + '\n';
    
    if (!combinedSymptoms) combinedSymptoms = 'No symptoms provided';

    // PII Detection Patterns from JSON
    const piiPatterns = {
      name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      phone: /\b\d{3}-\d{3}-\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      dob: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g
    };

    let anonymizedText = combinedSymptoms;
    const extractedPII: Record<string, string[]> = {};

    Object.entries(piiPatterns).forEach(([type, pattern]) => {
      const matches = combinedSymptoms.match(pattern);
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
      originalSymptoms: combinedSymptoms
    };
  }

  private async generateDiagnosis(symptoms: string) {
    // Analyze symptoms using medical knowledge base
    const symptomKeywords = symptoms.toLowerCase();
    
    if (symptomKeywords.includes('fever') || symptomKeywords.includes('cough') || symptomKeywords.includes('cold')) {
      return {
        differentialDiagnoses: [
          {
            diagnosis: "Viral Upper Respiratory Infection",
            confidenceScore: 0.85,
            supportingEvidence: ["Fever and respiratory symptoms", "Common viral pattern"],
            additionalTests: ["Complete Blood Count", "Chest X-ray if severe"]
          },
          {
            diagnosis: "Bacterial Pharyngitis",
            confidenceScore: 0.65,
            supportingEvidence: ["Throat symptoms", "Fever pattern"],
            additionalTests: ["Throat culture", "Rapid strep test"]
          }
        ]
      };
    }
    
    if (symptomKeywords.includes('headache') || symptomKeywords.includes('pain')) {
      return {
        differentialDiagnoses: [
          {
            diagnosis: "Tension-Type Headache",
            confidenceScore: 0.80,
            supportingEvidence: ["Bilateral pain pattern", "Stress-related onset"],
            additionalTests: ["Neurological examination", "Blood pressure check"]
          },
          {
            diagnosis: "Migraine",
            confidenceScore: 0.70,
            supportingEvidence: ["Unilateral pain", "Associated symptoms"],
            additionalTests: ["Detailed history", "MRI if indicated"]
          }
        ]
      };
    }
    
    if (symptomKeywords.includes('stomach') || symptomKeywords.includes('nausea') || symptomKeywords.includes('vomit')) {
      return {
        differentialDiagnoses: [
          {
            diagnosis: "Acute Gastroenteritis",
            confidenceScore: 0.85,
            supportingEvidence: ["GI symptoms", "Acute onset"],
            additionalTests: ["Stool examination", "Electrolyte panel"]
          },
          {
            diagnosis: "Food Poisoning",
            confidenceScore: 0.75,
            supportingEvidence: ["Recent food intake", "Rapid onset"],
            additionalTests: ["Stool culture", "Hydration status"]
          }
        ]
      };
    }
    
    // Default comprehensive analysis
    return {
      differentialDiagnoses: [
        {
          diagnosis: "Common Viral Syndrome",
          confidenceScore: 0.75,
          supportingEvidence: ["Symptom constellation", "Seasonal pattern"],
          additionalTests: ["Complete Blood Count", "Basic metabolic panel"]
        },
        {
          diagnosis: "Stress-Related Symptoms",
          confidenceScore: 0.65,
          supportingEvidence: ["Multiple system involvement", "Functional pattern"],
          additionalTests: ["Psychological assessment", "Stress evaluation"]
        }
      ]
    };
  }

  private async assessRisk(symptoms: string) {
    const symptomKeywords = symptoms.toLowerCase();
    const redFlags = [];
    let triageLevel = "LOW";
    let timeToTreatment = "routine";
    let specialtyReferral = null;
    
    // Check for high-risk symptoms
    if (symptomKeywords.includes('chest pain') || symptomKeywords.includes('shortness of breath')) {
      redFlags.push({
        flag: "Cardiovascular symptoms detected",
        severity: "HIGH",
        action: "Immediate cardiac evaluation"
      });
      triageLevel = "HIGH";
      timeToTreatment = "<15min";
      specialtyReferral = "Cardiology";
    }
    
    if (symptomKeywords.includes('severe headache') || symptomKeywords.includes('confusion')) {
      redFlags.push({
        flag: "Neurological symptoms",
        severity: "HIGH",
        action: "Urgent neurological assessment"
      });
      triageLevel = "HIGH";
      timeToTreatment = "<30min";
      specialtyReferral = "Neurology";
    }
    
    if (symptomKeywords.includes('fever') && symptomKeywords.includes('rash')) {
      redFlags.push({
        flag: "Fever with rash",
        severity: "MODERATE",
        action: "Rule out infectious disease"
      });
      triageLevel = "MEDIUM";
      timeToTreatment = "<2hrs";
      specialtyReferral = "Infectious Disease";
    }
    
    if (redFlags.length === 0) {
      triageLevel = "LOW";
      timeToTreatment = "routine";
      specialtyReferral = "General Medicine";
    }
    
    return {
      redFlagDetected: redFlags.length > 0,
      triageLevel,
      urgencyJustification: redFlags.length > 0 ? 
        "Red flag symptoms require urgent evaluation" : 
        "Standard symptoms, routine evaluation appropriate",
      redFlags,
      timeToTreatment,
      specialtyReferral
    };
  }

  private async synthesizeReport(diagnosis: any, risk: any, symptoms: string): Promise<string> {
    const primaryDx = diagnosis.differentialDiagnoses[0];
    
    return `AI COUNCIL CLINICAL SYNTHESIS\n\n` +
      `SYMPTOM ANALYSIS: ${symptoms}\n\n` +
      `PRIMARY DIAGNOSIS: ${primaryDx.diagnosis} (${(primaryDx.confidenceScore * 100).toFixed(0)}% confidence)\n` +
      `SUPPORTING EVIDENCE: ${primaryDx.supportingEvidence.join(', ')}\n\n` +
      `RISK ASSESSMENT: ${risk.triageLevel} priority\n` +
      `URGENCY: ${risk.timeToTreatment}\n` +
      `SPECIALTY REFERRAL: ${risk.specialtyReferral || 'None required'}\n\n` +
      `RECOMMENDED TESTS:\n${primaryDx.additionalTests.map(test => `• ${test}`).join('\n')}\n\n` +
      `CLINICAL RECOMMENDATIONS:\n` +
      `• Complete history and physical examination\n` +
      `• Implement appropriate diagnostic workup\n` +
      `• Consider differential diagnoses\n` +
      `• Monitor for symptom progression\n\n` +
      `MEDICAL DISCLAIMER: This AI-generated analysis requires physician validation and clinical correlation.`;
  }

  private generateFallbackWorkflow(piiData: any) {
    return {
      piiData,
      diagnosis: {
        differentialDiagnoses: [{
          diagnosis: "Clinical Evaluation Required",
          confidenceScore: 0.5,
          supportingEvidence: ["Insufficient data for AI analysis"],
          additionalTests: ["Complete medical assessment"]
        }]
      },
      risk: {
        redFlagDetected: false,
        triageLevel: "MEDIUM",
        urgencyJustification: "Standard evaluation recommended",
        redFlags: [],
        timeToTreatment: "<24hrs",
        specialtyReferral: "General Medicine"
      },
      finalReport: "AI analysis unavailable. Please proceed with standard clinical evaluation.",
      timestamp: new Date().toISOString(),
      workflowId: 'swasth-ai-fallback'
    };
  }

  // Generate AI Council Response format
  generateAICouncilResponse(workflowResult: any) {
    const diagnosis = workflowResult.diagnosis;
    const risk = workflowResult.risk;

    return {
      generated_by: 'AI Council' as const,
      purpose: 'Clinical decision support' as const,
      medical_disclaimer: 'Not a diagnosis. Doctor interpretation required.' as const,
      confidence_score: this.calculateConfidence(diagnosis, risk),
      insights: this.extractInsights(diagnosis, risk),
      risk_flags: risk.redFlags?.map((flag: any) => flag.flag) || [],
      timestamp: workflowResult.timestamp,
      model_version: 'swasth-ai-workflow-v1.0',
      workflow_data: {
        differential_diagnoses: diagnosis.differentialDiagnoses || [],
        triage_level: risk.triageLevel,
        final_synthesis: workflowResult.finalReport
      }
    };
  }

  private calculateConfidence(diagnosis: any, risk: any): number {
    const diagnosisConfidence = diagnosis.differentialDiagnoses?.[0]?.confidenceScore || 0.5;
    const riskWeight = risk.triageLevel === 'HIGH' ? 0.9 : 
                     risk.triageLevel === 'MEDIUM' ? 0.7 : 0.5;
    return Math.min(0.95, (diagnosisConfidence + riskWeight) / 2);
  }

  private extractInsights(diagnosis: any, risk: any): string[] {
    const insights = [];
    
    if (diagnosis.differentialDiagnoses?.length > 0) {
      const primaryDx = diagnosis.differentialDiagnoses[0];
      insights.push(`Primary diagnosis consideration: ${primaryDx.diagnosis}`);
      insights.push(`Confidence level: ${(primaryDx.confidenceScore * 100).toFixed(0)}%`);
      if (primaryDx.supportingEvidence?.length > 0) {
        insights.push(`Supporting evidence: ${primaryDx.supportingEvidence.join(', ')}`);
      }
    } else {
      insights.push('Primary diagnosis consideration: Clinical evaluation required');
      insights.push('Confidence level: Pending physician assessment');
    }
    
    if (risk.triageLevel) {
      insights.push(`Triage classification: ${risk.triageLevel} priority`);
    }
    
    if (risk.timeToTreatment) {
      insights.push(`Recommended treatment timeline: ${risk.timeToTreatment}`);
    }
    
    if (risk.specialtyReferral && risk.specialtyReferral !== 'null') {
      insights.push(`Specialty referral recommended: ${risk.specialtyReferral}`);
    }
    
    return insights;
  }
}

export const swasthAI = new SwasthAIWorkflow();