import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { patientMemory } from './langchainMemory';
import { medicalRAG } from './langchainRAG';

const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.1,
  openAIApiKey: "your-openai-api-key"
});

// Medical Diagnosis Chain
const diagnosisPrompt = PromptTemplate.fromTemplate(`
You are a medical AI assistant. Analyze symptoms and provide differential diagnosis.

Patient Information:
- Age: {age}
- Gender: {gender}
- Symptoms: {symptoms}
- Medical History: {history}

Provide:
1. Primary differential diagnoses (top 3)
2. Recommended tests
3. Risk assessment (Low/Medium/High)
4. Specialist referral if needed

MEDICAL DISCLAIMER: This is AI-generated information for healthcare professional review only. Not a substitute for professional medical diagnosis.

Analysis:
`);

export const diagnosisChain = RunnableSequence.from([
  diagnosisPrompt,
  model,
  new StringOutputParser()
]);

// Emergency Triage Chain
const triagePrompt = PromptTemplate.fromTemplate(`
Emergency Triage Assessment:

Symptoms: {symptoms}
Vital Signs: {vitals}
Patient Age: {age}

Determine:
1. Triage Level (1-Critical, 2-Urgent, 3-Less Urgent, 4-Non-urgent)
2. Immediate Actions Required
3. Specialist Needed
4. Estimated Response Time

Response:
`);

export const triageChain = RunnableSequence.from([
  triagePrompt,
  model,
  new StringOutputParser()
]);

// Prescription Validation Chain
const prescriptionPrompt = PromptTemplate.fromTemplate(`
Validate prescription safety:

Medication: {medication}
Dosage: {dosage}
Patient Age: {age}
Weight: {weight}
Allergies: {allergies}
Current Medications: {currentMeds}

Check for:
1. Drug interactions
2. Dosage appropriateness
3. Contraindications
4. Allergy conflicts

Validation Result:
`);

export const prescriptionChain = RunnableSequence.from([
  prescriptionPrompt,
  model,
  new StringOutputParser()
]);

// Medical Knowledge RAG Chain (simplified)
const knowledgePrompt = PromptTemplate.fromTemplate(`
Medical Query: {query}
Context: {context}

Provide evidence-based medical information with citations.

Response:
`);

export const knowledgeChain = RunnableSequence.from([
  knowledgePrompt,
  model,
  new StringOutputParser()
]);

// Specialty Routing Chain
const routingPrompt = PromptTemplate.fromTemplate(`
Route patient to appropriate specialist based on symptoms:

Symptoms: {symptoms}
Primary Complaint: {complaint}

Available Specialists:
- Cardiology (heart, chest pain, palpitations)
- Dermatology (skin, rash, lesions)
- Neurology (headache, seizures, numbness)
- Orthopedics (bone, joint, muscle pain)
- Gastroenterology (stomach, digestive issues)
- General Medicine (general symptoms)

Recommended Specialist:
`);

export const routingChain = RunnableSequence.from([
  routingPrompt,
  model,
  new StringOutputParser()
]);

export class LangChainMedicalService {
  async generateDiagnosis(patientData: {
    age: string;
    gender: string;
    symptoms: string;
    history: string;
  }) {
    // Get medical knowledge context
    try {
      const ragResult = await medicalRAG.queryMedicalKnowledge(patientData.symptoms);
      const enhancedData = {
        ...patientData,
        medicalContext: ragResult.answer || 'No specific guidelines found'
      };
      
      const enhancedPrompt = PromptTemplate.fromTemplate(`
You are a medical AI assistant with access to medical guidelines.

Patient Information:
- Age: {age}
- Gender: {gender}
- Symptoms: {symptoms}
- Medical History: {history}
- Medical Guidelines: {medicalContext}

Provide:
1. Primary differential diagnoses (top 3)
2. Recommended tests
3. Risk assessment (Low/Medium/High)
4. Specialist referral if needed

MEDICAL DISCLAIMER: This is AI-generated information for healthcare professional review only.

Analysis:
`);
      
      const enhancedChain = RunnableSequence.from([
        enhancedPrompt,
        model,
        new StringOutputParser()
      ]);
      
      return await enhancedChain.invoke(enhancedData);
    } catch (error) {
      console.error('RAG error, using basic diagnosis:', error);
      return await diagnosisChain.invoke(patientData);
    }
  }

  async triageEmergency(emergencyData: {
    symptoms: string;
    vitals: string;
    age: string;
  }) {
    return await triageChain.invoke(emergencyData);
  }

  async validatePrescription(prescriptionData: {
    medication: string;
    dosage: string;
    age: string;
    weight: string;
    allergies: string;
    currentMeds: string;
  }) {
    return await prescriptionChain.invoke(prescriptionData);
  }

  async routeToSpecialist(symptoms: string, complaint: string) {
    return await routingChain.invoke({ symptoms, complaint });
  }

  async queryMedicalKnowledge(query: string, context: string = "") {
    try {
      const ragResult = await medicalRAG.queryMedicalKnowledge(query);
      return ragResult.answer;
    } catch (error) {
      console.error('RAG query error:', error);
      return await knowledgeChain.invoke({ query, context });
    }
  }

  async consultWithMemory(patientId: string, input: string) {
    return await patientMemory.consultWithMemory(patientId, input);
  }
}

export const langchainMedical = new LangChainMedicalService();