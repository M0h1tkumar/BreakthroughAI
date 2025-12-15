import { SecurityService } from './security';

interface TokenizedData {
  token: string;
  originalData: string;
  timestamp: string;
  assignedDoctor?: string;
}

class DataTokenizationService {
  private tokenMap: Map<string, TokenizedData> = new Map();
  private doctorAssignments: Map<string, string> = new Map();

  tokenizePatientData(patientData: any): string {
    const token = this.generateToken();
    const serializedData = JSON.stringify(patientData);
    const encryptedData = SecurityService.encryptSensitiveData(serializedData);
    
    // Assign to doctor based on symptoms severity
    const assignedDoctor = this.assignDoctorBasedOnSymptoms(patientData.symptoms);
    
    this.tokenMap.set(token, {
      token,
      originalData: encryptedData,
      timestamp: new Date().toISOString(),
      assignedDoctor
    });

    this.doctorAssignments.set(token, assignedDoctor);
    
    console.log(`🔐 Data tokenized: ${token} → Assigned to: ${assignedDoctor}`);
    return token;
  }

  private assignDoctorBasedOnSymptoms(symptoms: string[]): string {
    const symptomKeywords = symptoms.join(' ').toLowerCase();
    
    // Smart doctor assignment based on symptoms
    if (symptomKeywords.includes('chest') || symptomKeywords.includes('heart') || symptomKeywords.includes('cardiac')) {
      return 'd2'; // Dr. Rahul Johnson - Cardiology
    }
    
    if (symptomKeywords.includes('fever') || symptomKeywords.includes('cough') || symptomKeywords.includes('headache')) {
      return 'd1'; // Dr. Sunita Chen - General Medicine
    }
    
    // Default to general medicine
    return 'd1';
  }

  getTokenizedData(token: string): TokenizedData | null {
    return this.tokenMap.get(token) || null;
  }

  getAssignedDoctor(token: string): string | null {
    return this.doctorAssignments.get(token) || null;
  }

  decryptTokenizedData(token: string): any | null {
    const tokenData = this.tokenMap.get(token);
    if (!tokenData) return null;

    try {
      const decryptedData = SecurityService.decryptSensitiveData(tokenData.originalData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt tokenized data:', error);
      return null;
    }
  }

  private generateToken(): string {
    return 'TKN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getAllTokensForDoctor(doctorId: string): string[] {
    return Array.from(this.doctorAssignments.entries())
      .filter(([_, assignedDoctor]) => assignedDoctor === doctorId)
      .map(([token, _]) => token);
  }

  getTokenizationStats() {
    return {
      totalTokens: this.tokenMap.size,
      doctorAssignments: Array.from(this.doctorAssignments.entries()).reduce((acc, [token, doctorId]) => {
        acc[doctorId] = (acc[doctorId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const tokenizationService = new DataTokenizationService();