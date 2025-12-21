// Simplified medical knowledge base
const medicalKnowledge = {
  'chest pain': 'Chest pain with shortness of breath may indicate cardiac issues. Immediate evaluation required.',
  'skin rash': 'Skin rashes with fever may indicate allergic reactions. Consider dermatology consultation.',
  'headache': 'Headaches with neurological symptoms require immediate assessment. Consider CT scan for acute cases.',
  'joint pain': 'Joint pain may indicate orthopedic issues. Consider X-ray and orthopedic consultation.',
  'stomach pain': 'Stomach pain may indicate gastroenterological issues. Consider gastroenterology consultation.'
};

export class MedicalRAGService {
  async queryMedicalKnowledge(query: string) {
    const lowerQuery = query.toLowerCase();
    
    for (const [key, value] of Object.entries(medicalKnowledge)) {
      if (lowerQuery.includes(key)) {
        return { answer: value };
      }
    }
    
    return { answer: 'General medical evaluation recommended. Consult with appropriate specialist.' };
  }

  async addMedicalDocument(content: string, metadata: any) {
    // Simplified - just log for now
    console.log('Medical document added:', content, metadata);
  }
}

export const medicalRAG = new MedicalRAGService();