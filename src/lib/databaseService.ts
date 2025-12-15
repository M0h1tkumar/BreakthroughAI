import { mongoDB } from './mongoDatabase';

// Fallback to in-memory database if MongoDB fails
import { secureDB } from './secureDatabase';

class DatabaseService {
  private useMongoFallback = false;

  async initialize(): Promise<void> {
    try {
      await mongoDB.connect();
      await mongoDB.initializeSampleData();
      console.log('✅ Using MongoDB for data persistence');
    } catch (error) {
      console.warn('⚠️ MongoDB unavailable, using local storage fallback');
      this.useMongoFallback = true;
    }
  }

  // Patient operations
  async getPatients(status?: string, doctorId?: string) {
    if (this.useMongoFallback) {
      return secureDB.getPatients(status, doctorId);
    }
    return await mongoDB.getPatients(status, doctorId);
  }

  async addPatient(patient: any) {
    if (this.useMongoFallback) {
      return secureDB.addPatient(patient);
    }
    return await mongoDB.addPatient(patient);
  }

  async updatePatient(patientId: string, updates: any) {
    if (this.useMongoFallback) {
      return secureDB.updatePatient(patientId, updates);
    }
    return await mongoDB.updatePatient(patientId, updates);
  }

  // Report operations
  async getReports() {
    if (this.useMongoFallback) {
      return secureDB.getReports();
    }
    return await mongoDB.getReports();
  }

  async addReport(report: any) {
    if (this.useMongoFallback) {
      return secureDB.addReport(report);
    }
    return await mongoDB.addReport(report);
  }

  async updateReport(reportId: string, updates: any) {
    if (this.useMongoFallback) {
      return secureDB.updateReport(reportId, updates);
    }
    return await mongoDB.updateReport(reportId, updates);
  }

  async getLockedReports() {
    if (this.useMongoFallback) {
      return secureDB.getLockedReports();
    }
    return await mongoDB.getLockedReports();
  }

  // Prescription operations
  async createPrescription(prescription: any) {
    if (this.useMongoFallback) {
      return secureDB.createPrescription(prescription);
    }
    return await mongoDB.createPrescription(prescription);
  }

  async getPrescriptions(pharmacyId?: string) {
    if (this.useMongoFallback) {
      return secureDB.getPrescriptions(pharmacyId);
    }
    return await mongoDB.getPrescriptions(pharmacyId);
  }

  async updatePrescriptionStatus(prescriptionId: string, status: string) {
    if (this.useMongoFallback) {
      return secureDB.updatePrescriptionStatus(prescriptionId, status);
    }
    return await mongoDB.updatePrescriptionStatus(prescriptionId, status);
  }

  // Utility methods from secureDB
  getDoctors() {
    return secureDB.getDoctors();
  }

  getMedicines() {
    return secureDB.getMedicines();
  }

  searchMedicines(query: string, category?: string) {
    return secureDB.searchMedicines(query, category);
  }

  getMedicineCategories() {
    return secureDB.getMedicineCategories();
  }

  generateEBill(prescriptionId: string, pharmacyId: string) {
    return secureDB.generateEBill(prescriptionId, pharmacyId);
  }
}

export const dbService = new DatabaseService();