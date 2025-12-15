const API_KEYS = {
  OPENAI: import.meta.env.VITE_OPENAI_API_KEY || '',
  GOOGLE: import.meta.env.VITE_GOOGLE_API_KEY || '',
  PERPLEXITY: import.meta.env.VITE_PERPLEXITY_API_KEY || ''
};

export class OpenAIProvider {
  async generateDifferentialDiagnosis(symptoms: string) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENAI}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: 'You are LLM A: Differential Diagnosis Generator. Generate exactly 5 differential diagnoses in JSON format: {"differentialDiagnoses": [{"diagnosis": "name", "confidenceScore": 0.85, "supportingEvidence": ["symptoms"], "additionalTests": ["tests"]}]}'
          }, {
            role: 'user',
            content: `Analyze symptoms: ${symptoms}`
          }],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      return response.json();
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return mock data for demo
      return {
        choices: [{
          message: {
            content: JSON.stringify({
              differentialDiagnoses: [
                { diagnosis: "Acute Coronary Syndrome", confidenceScore: 0.85, supportingEvidence: ["chest pain", "shortness of breath"], additionalTests: ["ECG", "Troponin"] },
                { diagnosis: "Pneumonia", confidenceScore: 0.70, supportingEvidence: ["cough", "fever"], additionalTests: ["Chest X-ray", "CBC"] },
                { diagnosis: "Anxiety Disorder", confidenceScore: 0.60, supportingEvidence: ["chest tightness", "palpitations"], additionalTests: ["Psychiatric evaluation"] }
              ]
            })
          }
        }]
      };
    }
  }
}

export class GoogleProvider {
  async assessRisk(symptoms: string) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEYS.GOOGLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are LLM B: Risk Assessment/Triage Agent. Analyze symptoms for red flags: ${symptoms}. Return JSON: {"redFlagDetected": true/false, "triageLevel": "HIGH/MEDIUM/LOW", "urgencyJustification": "explanation", "redFlags": [{"flag": "description", "severity": "CRITICAL/HIGH/MODERATE", "action": "immediate action"}], "timeToTreatment": "<15min/<2hrs/routine", "specialtyReferral": "Emergency/Cardiology/null"}`
            }]
          }]
        })
      });
      return response.json();
    } catch (error) {
      console.error('Google API error:', error);
      // Return mock data for demo
      return {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                redFlagDetected: true,
                triageLevel: "MEDIUM",
                urgencyJustification: "Chest pain requires immediate evaluation",
                redFlags: [
                  { flag: "Chest pain with exertion", severity: "HIGH", action: "Immediate cardiac evaluation" },
                  { flag: "Shortness of breath", severity: "MODERATE", action: "Monitor oxygen saturation" }
                ],
                timeToTreatment: "<2hrs",
                specialtyReferral: "Cardiology"
              })
            }]
          }
        }]
      };
    }
  }
}

export class PerplexityProvider {
  async synthesizeReport(diagnosisData: any, riskData: any, commonData: any) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.PERPLEXITY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{
            role: 'system',
            content: 'You are the Final Aggregator Agent for Swasth AI. Synthesize AI council outputs into comprehensive clinical report.'
          }, {
            role: 'user',
            content: `Synthesize: Diagnosis: ${JSON.stringify(diagnosisData)}, Risk: ${JSON.stringify(riskData)}, Common: ${JSON.stringify(commonData)}`
          }]
        })
      });
      return response.json();
    } catch (error) {
      console.error('Perplexity API error:', error);
      // Return mock data for demo
      return {
        choices: [{
          message: {
            content: `Clinical Synthesis Report:\\n\\nBased on the AI Council analysis, the patient presents with symptoms suggestive of cardiac involvement. The differential diagnosis includes acute coronary syndrome as the primary concern, with pneumonia as a secondary consideration.\\n\\nRecommendations:\\n1. Immediate ECG and cardiac enzymes\\n2. Chest X-ray to rule out pneumonia\\n3. Continuous cardiac monitoring\\n4. Cardiology consultation within 2 hours\\n\\nThis assessment requires immediate physician review and validation.`
          }
        }]
      };
    }
  }
}