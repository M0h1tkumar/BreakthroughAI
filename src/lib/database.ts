interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  symptoms: string[];
  reports: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  license: string;
}

interface Report {
  id: string;
  patientId: string;
  doctorId: string;
  content: string;
  status: string;
  date: string;
}

class DatabaseService {
  private patients: Patient[] = [
    { id: '1', name: 'Raj Kumar', age: 45, phone: '9876543210', symptoms: ['chest pain', 'shortness of breath'], reports: ['r1'] },
    { id: '2', name: 'Priya Sharma', age: 32, phone: '9876543211', symptoms: ['fever', 'cough'], reports: ['r2'] },
    { id: '3', name: 'Amit Patel', age: 28, phone: '9876543212', symptoms: ['headache', 'dizziness'], reports: [] }
  ];

  private doctors: Doctor[] = [
    { id: 'd1', name: 'Dr. Sunita Chen', specialty: 'General Medicine', license: 'MD123456' },
    { id: 'd2', name: 'Dr. Rahul Johnson', specialty: 'Cardiology', license: 'MD789012' }
  ];

  private reports: Report[] = [
    { id: 'r1', patientId: '1', doctorId: 'd1', content: 'Cardiac examination normal', status: 'APPROVED', date: '2024-01-15' },
    { id: 'r2', patientId: '2', doctorId: 'd1', content: 'Viral fever treatment', status: 'DRAFT', date: '2024-01-16' }
  ];

  getPatients(): Patient[] {
    return this.patients;
  }

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getReports(): Report[] {
    return this.reports;
  }

  addPatient(patient: Omit<Patient, 'id'>): Patient {
    const newPatient = { ...patient, id: Date.now().toString() };
    this.patients.push(newPatient);
    return newPatient;
  }

  addReport(report: Omit<Report, 'id'>): Report {
    const newReport = { ...report, id: Date.now().toString() };
    this.reports.push(newReport);
    return newReport;
  }

  updateReport(id: string, updates: Partial<Report>): Report | null {
    const index = this.reports.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reports[index] = { ...this.reports[index], ...updates };
      return this.reports[index];
    }
    return null;
  }
}

export const database = new DatabaseService();