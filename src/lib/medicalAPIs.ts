// Medical APIs Integration
export class MedicalAPIs {
  
  // FHIR API for patient records
  static async getPatientRecord(patientId: string) {
    try {
      // Using public FHIR test server
      const response = await fetch(`https://hapi.fhir.org/baseR4/Patient/${patientId}`);
      return await response.json();
    } catch (error) {
      console.error('FHIR API Error:', error);
      return null;
    }
  }

  // Drug Information API
  static async getDrugInfo(drugName: string) {
    try {
      // Using OpenFDA API
      const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`);
      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      console.error('Drug API Error:', error);
      return null;
    }
  }

  // ICD-10 Diagnosis Codes
  static async getICD10Code(diagnosis: string) {
    try {
      // Using free ICD API
      const response = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${diagnosis}`);
      const data = await response.json();
      return data[3]?.[0] || null;
    } catch (error) {
      console.error('ICD-10 API Error:', error);
      return null;
    }
  }

  // Medical Knowledge Base
  static async getMedicalInfo(condition: string) {
    try {
      // Using PubMed API
      const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${condition}&retmode=json&retmax=5`);
      const data = await response.json();
      return data.esearchresult?.idlist || [];
    } catch (error) {
      console.error('PubMed API Error:', error);
      return [];
    }
  }

  // Lab Values Reference
  static getLabReference(testName: string) {
    const labRanges = {
      'hemoglobin': { normal: '12-16 g/dL', unit: 'g/dL' },
      'glucose': { normal: '70-100 mg/dL', unit: 'mg/dL' },
      'cholesterol': { normal: '<200 mg/dL', unit: 'mg/dL' },
      'blood_pressure': { normal: '120/80 mmHg', unit: 'mmHg' },
      'heart_rate': { normal: '60-100 bpm', unit: 'bpm' }
    };
    return labRanges[testName.toLowerCase()] || null;
  }

  // Drug Interaction Check
  static async checkDrugInteractions(drug1: string, drug2: string) {
    // Mock implementation - in production use RxNorm API
    const interactions = {
      'warfarin+aspirin': { severity: 'HIGH', description: 'Increased bleeding risk' },
      'metformin+alcohol': { severity: 'MEDIUM', description: 'Risk of lactic acidosis' }
    };
    
    const key = `${drug1.toLowerCase()}+${drug2.toLowerCase()}`;
    return interactions[key] || { severity: 'LOW', description: 'No known interactions' };
  }

  // Symptom to Specialist Mapping
  static getSpecialistRecommendation(symptoms: string[]) {
    const specialistMap = {
      'chest pain': 'Cardiology',
      'heart': 'Cardiology',
      'cardiac': 'Cardiology',
      'skin': 'Dermatology',
      'rash': 'Dermatology',
      'acne': 'Dermatology',
      'bone': 'Orthopedics',
      'joint': 'Orthopedics',
      'fracture': 'Orthopedics',
      'eye': 'Ophthalmology',
      'vision': 'Ophthalmology',
      'ear': 'ENT',
      'throat': 'ENT',
      'nose': 'ENT',
      'brain': 'Neurology',
      'headache': 'Neurology',
      'seizure': 'Neurology'
    };

    for (const symptom of symptoms) {
      for (const [key, specialist] of Object.entries(specialistMap)) {
        if (symptom.toLowerCase().includes(key)) {
          return specialist;
        }
      }
    }
    return 'General Medicine';
  }
}