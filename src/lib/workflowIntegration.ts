import { OpenAIProvider, GoogleProvider, PerplexityProvider } from './aiProviders';

interface WorkflowNode {
  id: string;
  type: string;
  parameters: any;
}

class SwasthWorkflowService {
  private openai = new OpenAIProvider();
  private google = new GoogleProvider();
  private perplexity = new PerplexityProvider();

  async executeWorkflow(symptoms: string) {
    // Step 1: PII Separation (from workflow JSON)
    const piiSeparated = this.separatePII(symptoms);
    
    // Step 2: Parallel AI Processing
    const [diagnosisResult, riskResult] = await Promise.all([
      this.openai.generateDifferentialDiagnosis(piiSeparated.anonymizedSymptoms),
      this.google.assessRisk(piiSeparated.anonymizedSymptoms)
    ]);

    // Step 3: Extract and parse responses
    const diagnosis = this.parseOpenAIResponse(diagnosisResult);
    const risk = this.parseGoogleResponse(riskResult);

    // Step 4: Final synthesis
    const synthesis = await this.perplexity.synthesizeReport(diagnosis, risk, {});

    return {
      piiData: piiSeparated,
      diagnosis,
      risk,
      synthesis: this.parsePerplexityResponse(synthesis),
      timestamp: new Date().toISOString()
    };
  }

  private separatePII(text: string) {
    const piiPatterns = {
      name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      phone: /\b\d{10}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    };

    let anonymized = text;
    const extracted: any = {};

    Object.entries(piiPatterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        extracted[type] = matches;
        matches.forEach((match, i) => {
          anonymized = anonymized.replace(match, `[${type.toUpperCase()}_${i + 1}]`);
        });
      }
    });

    return {
      originalSymptoms: text,
      anonymizedSymptoms: anonymized,
      extractedPII: extracted
    };
  }

  private parseOpenAIResponse(response: any) {
    try {
      return JSON.parse(response.choices[0].message.content);
    } catch {
      return { differentialDiagnoses: [] };
    }
  }

  private parseGoogleResponse(response: any) {
    try {
      return JSON.parse(response.candidates[0].content.parts[0].text);
    } catch {
      return { redFlagDetected: false, triageLevel: 'LOW' };
    }
  }

  private parsePerplexityResponse(response: any) {
    try {
      return response.choices[0].message.content;
    } catch {
      return 'Synthesis unavailable';
    }
  }
}

export const swasthWorkflow = new SwasthWorkflowService();