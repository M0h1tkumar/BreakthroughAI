// Simplified patient memory service
export class PatientMemoryService {
  private patientHistory: Map<string, string[]> = new Map();

  addToHistory(patientId: string, message: string) {
    if (!this.patientHistory.has(patientId)) {
      this.patientHistory.set(patientId, []);
    }
    this.patientHistory.get(patientId)!.push(message);
  }

  getHistory(patientId: string): string[] {
    return this.patientHistory.get(patientId) || [];
  }

  async consultWithMemory(patientId: string, input: string) {
    this.addToHistory(patientId, input);
    const history = this.getHistory(patientId);
    
    return {
      response: `Medical consultation for patient ${patientId}. Input: ${input}. History: ${history.length} previous interactions.`,
      history: history
    };
  }

  clearPatientMemory(patientId: string) {
    this.patientHistory.delete(patientId);
  }
}

export const patientMemory = new PatientMemoryService();