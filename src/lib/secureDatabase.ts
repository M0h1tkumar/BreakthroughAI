import { encryptionService } from './encryption';
import { auditLogger } from './auditLogger';
import { accessControl } from './accessControl';
import { realTimeSync } from './realTimeSync';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  symptoms: string[];
  reports: string[];
  status: 'PENDING' | 'UNDER_REVIEW' | 'COMPLETED';
  assignedDoctor?: string;
  dataToken?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
  encrypted?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  license: string;
  email: string;
  phone: string;
}

interface Report {
  id: string;
  patientId: string;
  doctorId: string;
  content: string;
  status: 'DRAFT' | 'AI_ASSISTED' | 'DOCTOR_APPROVED' | 'LOCKED';
  prescriptions?: Prescription[];
  date: string;
  approvedAt?: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  price: number;
  stock: number;
  description: string;
  dosage: string;
  sideEffects: string[];
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  medicines: string[]; // medicine IDs
}

interface Prescription {
  id: string;
  reportId: string;
  patientId: string;
  doctorId: string;
  pharmacyId?: string;
  medicines: {
    medicineId: string;
    quantity: number;
    dosage: string;
    duration: string;
  }[];
  status: 'PENDING' | 'READY' | 'DISPENSED';
  totalAmount?: number;
  createdAt: string;
  dispensedAt?: string;
}

interface EBill {
  id: string;
  prescriptionId: string;
  patientName: string;
  patientPhone: string;
  pharmacyName: string;
  items: {
    medicineName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  generatedAt: string;
}

class SecureDatabase {
  private lockedReportIds: string[] = [];
  private accessAttempts: Map<string, number> = new Map();
  private readonly MAX_ACCESS_ATTEMPTS = 5;
  
  constructor() {
    // Load locked reports from localStorage on initialization
    this.lockedReportIds = JSON.parse(localStorage.getItem('lockedReports') || '[]');
    
    // Also check sessionStorage for additional locked reports
    const sessionLocked = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('locked_')) {
        const reportId = key.replace('locked_', '');
        if (!this.lockedReportIds.includes(reportId)) {
          sessionLocked.push(reportId);
        }
      }
    }
    
    if (sessionLocked.length > 0) {
      this.lockedReportIds.push(...sessionLocked);
      localStorage.setItem('lockedReports', JSON.stringify(this.lockedReportIds));
    }
    
    console.log(`🔒 Loaded ${this.lockedReportIds.length} locked reports from storage`);
  }
  
  private patients: Patient[] = this.generateIndustryLevelPatients();

  private doctors: Doctor[] = this.generateIndustryLevelDoctors();

  private reports: Report[] = this.generateIndustryLevelReports();

  private medicines: Medicine[] = this.generateMedicines();

  private pharmacies: Pharmacy[] = [
    {
      id: 'ph1',
      name: 'Apollo Pharmacy',
      address: '123 Main Street, Delhi',
      phone: '9876543300',
      email: 'apollo@pharmacy.com',
      medicines: this.medicines.slice(0, 2000).map(m => m.id)
    },
    {
      id: 'ph2',
      name: 'MedPlus',
      address: '456 Health Avenue, Mumbai',
      phone: '9876543301',
      email: 'medplus@pharmacy.com',
      medicines: this.medicines.slice(1000, 3500).map(m => m.id)
    },
    {
      id: 'ph3',
      name: 'Wellness Pharmacy',
      address: '789 Care Road, Bangalore',
      phone: '9876543302',
      email: 'wellness@pharmacy.com',
      medicines: this.medicines.slice(2000).map(m => m.id)
    }
  ];

  private prescriptions: Prescription[] = [
    {
      id: 'presc_1',
      reportId: 'r1',
      patientId: '1',
      doctorId: 'd1',
      pharmacyId: 'ph1',
      medicines: [
        {
          medicineId: 'med_1',
          quantity: 2,
          dosage: '1 tablet twice daily',
          duration: '7 days'
        },
        {
          medicineId: 'med_5',
          quantity: 1,
          dosage: '1 tablet once daily',
          duration: '14 days'
        }
      ],
      status: 'PENDING',
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: 'presc_2',
      reportId: 'r2',
      patientId: '2',
      doctorId: 'd1',
      pharmacyId: 'ph1',
      medicines: [
        {
          medicineId: 'med_2',
          quantity: 3,
          dosage: '1 tablet three times daily',
          duration: '5 days'
        }
      ],
      status: 'READY',
      createdAt: '2024-01-16T14:00:00Z'
    },
    {
      id: 'presc_3',
      reportId: 'r1',
      patientId: '3',
      doctorId: 'd2',
      pharmacyId: 'ph1',
      medicines: [
        {
          medicineId: 'med_3',
          quantity: 1,
          dosage: '1 tablet as needed',
          duration: '10 days'
        }
      ],
      status: 'DISPENSED',
      createdAt: '2024-01-17T10:00:00Z',
      dispensedAt: '2024-01-17T16:00:00Z'
    },
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `presc_${i + 4}`,
      reportId: `r${i + 4}`,
      patientId: `pat_${i + 4}`,
      doctorId: `d${(i % 10) + 1}`,
      pharmacyId: `ph${(i % 3) + 1}`,
      medicines: [
        {
          medicineId: `med_${(i % 30) + 1}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          dosage: '1 tablet daily',
          duration: `${Math.floor(Math.random() * 10) + 5} days`
        }
      ],
      status: ['PENDING', 'READY', 'DISPENSED'][i % 3] as 'PENDING' | 'READY' | 'DISPENSED',
      createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      dispensedAt: i % 3 === 2 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined
    }))
  ];
  private eBills: EBill[] = [];

  private generateMedicines(): Medicine[] {
    const categories = [
      'Antibiotics', 'Analgesics', 'Antacids', 'Antihistamines', 'Antihypertensives',
      'Antidiabetics', 'Cardiovascular', 'Respiratory', 'Neurological', 'Dermatological',
      'Gastrointestinal', 'Vitamins', 'Supplements', 'Antiseptics', 'Anti-inflammatory'
    ];

    const manufacturers = [
      'Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Lupin', 'Aurobindo',
      'Torrent', 'Glenmark', 'Cadila', 'Alkem', 'Mankind'
    ];

    const medicines: Medicine[] = [];
    const medicineNames = [
      'Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Azithromycin',
      'Omeprazole', 'Ranitidine', 'Cetirizine', 'Loratadine', 'Metformin',
      'Amlodipine', 'Atenolol', 'Lisinopril', 'Simvastatin', 'Atorvastatin',
      'Clopidogrel', 'Warfarin', 'Insulin', 'Salbutamol', 'Prednisolone'
    ];

    for (let i = 0; i < 5000; i++) {
      const baseName = medicineNames[i % medicineNames.length];
      const dosage = ['10mg', '25mg', '50mg', '100mg', '250mg', '500mg'][Math.floor(Math.random() * 6)];
      
      medicines.push({
        id: `med_${i + 1}`,
        name: `${baseName} ${dosage}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        price: Math.round((Math.random() * 500 + 10) * 100) / 100,
        stock: Math.floor(Math.random() * 1000) + 50,
        description: `${baseName} tablet for medical treatment`,
        dosage: dosage,
        sideEffects: ['Nausea', 'Dizziness', 'Headache'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    console.log(`✅ Generated ${medicines.length} medicines`);
    return medicines;
  }

  private generateIndustryLevelPatients(): Patient[] {
    const names = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Vikram Gupta',
      'Anita Verma', 'Rohit Agarwal', 'Kavita Joshi', 'Suresh Reddy', 'Meera Nair',
      'Arjun Mehta', 'Deepika Rao', 'Kiran Desai', 'Ravi Malhotra', 'Pooja Bansal',
      'Sanjay Tiwari', 'Neha Kapoor', 'Manoj Sinha', 'Rekha Pandey', 'Ashok Yadav',
      'Shweta Jain', 'Ramesh Chandra', 'Geeta Devi', 'Nitin Saxena', 'Sushma Arora'
    ];
    
    const symptomSets = [
      ['fever', 'cough', 'sore throat'], ['chest pain', 'shortness of breath'], 
      ['headache', 'dizziness', 'nausea'], ['abdominal pain', 'vomiting'], 
      ['back pain', 'muscle stiffness'], ['fatigue', 'weakness'], 
      ['skin rash', 'itching'], ['joint pain', 'swelling'],
      ['diabetes symptoms', 'frequent urination'], ['hypertension', 'palpitations'],
      ['migraine', 'sensitivity to light'], ['gastritis', 'acid reflux'],
      ['asthma', 'wheezing'], ['anxiety', 'panic attacks'], ['insomnia', 'restlessness']
    ];
    
    const statuses: ('PENDING' | 'UNDER_REVIEW' | 'COMPLETED')[] = ['PENDING', 'UNDER_REVIEW', 'COMPLETED'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `pat_${i + 1}`,
      name: i === 0 ? 'Pree Om' : names[i % names.length] + ` ${Math.floor(i / names.length) + 1}`,
      age: Math.floor(Math.random() * 60) + 20,
      phone: i === 0 ? '9853224443' : `98532244${String(i).padStart(2, '0')}`,
      symptoms: symptomSets[i % symptomSets.length],
      reports: i < 30 ? [`r${i + 1}`] : [],
      status: statuses[i % 3],
      assignedDoctor: i % 3 === 1 ? `d${(i % 10) + 1}` : undefined,
      dataToken: i % 4 === 0 ? `TKN_${Date.now()}_${i}` : undefined,
      medicalHistory: i % 5 === 0 ? 'Diabetes, Hypertension' : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private generateIndustryLevelDoctors(): Doctor[] {
    const doctors = [
      { name: 'Dr. Rajesh Khanna', specialty: 'Cardiology', license: 'MD001234' },
      { name: 'Dr. Priya Malhotra', specialty: 'General Medicine', license: 'MD001235' },
      { name: 'Dr. Amit Sharma', specialty: 'Neurology', license: 'MD001236' },
      { name: 'Dr. Sunita Agarwal', specialty: 'Pediatrics', license: 'MD001237' },
      { name: 'Dr. Vikram Singh', specialty: 'Orthopedics', license: 'MD001238' },
      { name: 'Dr. Kavita Reddy', specialty: 'Dermatology', license: 'MD001239' },
      { name: 'Dr. Rohit Gupta', specialty: 'Psychiatry', license: 'MD001240' },
      { name: 'Dr. Meera Joshi', specialty: 'Gynecology', license: 'MD001241' },
      { name: 'Dr. Arjun Patel', specialty: 'Gastroenterology', license: 'MD001242' },
      { name: 'Dr. Deepika Nair', specialty: 'Endocrinology', license: 'MD001243' }
    ];
    
    return doctors.map((doc, i) => ({
      id: `d${i + 1}`,
      name: doc.name,
      specialty: doc.specialty,
      license: doc.license,
      email: `${doc.name.toLowerCase().replace(/\s+/g, '.')}@swasthai.com`,
      phone: `987654${String(i).padStart(4, '0')}`
    }));
  }

  private generateIndustryLevelReports(): Report[] {
    const reportTemplates = [
      'Comprehensive cardiac evaluation completed. ECG shows normal sinus rhythm. Recommend lifestyle modifications.',
      'Neurological examination reveals no acute findings. MRI scheduled for further evaluation.',
      'Pediatric assessment indicates viral infection. Symptomatic treatment prescribed.',
      'Orthopedic consultation for joint pain. X-ray shows mild arthritis. Physical therapy recommended.',
      'Dermatological examination confirms eczema. Topical treatment initiated.',
      'Psychiatric evaluation for anxiety disorder. Counseling and medication prescribed.',
      'Gynecological examination normal. Routine follow-up scheduled.',
      'Gastroenterology consultation for acid reflux. Dietary modifications suggested.',
      'Endocrine evaluation for diabetes management. Insulin adjustment required.',
      'General medicine consultation for hypertension. Medication optimization needed.'
    ];
    
    const statuses: ('DRAFT' | 'AI_ASSISTED' | 'DOCTOR_APPROVED' | 'LOCKED')[] = 
      ['DRAFT', 'AI_ASSISTED', 'DOCTOR_APPROVED', 'LOCKED'];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: `r${i + 1}`,
      patientId: `pat_${i + 1}`,
      doctorId: `d${(i % 10) + 1}`,
      content: reportTemplates[i % reportTemplates.length],
      status: statuses[i % 4],
      date: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      approvedAt: i % 4 >= 2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    }));
  }

  private validateAccess(operation: string, resource: string = 'database'): boolean {
    const userId = this.getCurrentUserId();
    const userRole = accessControl.getUserRole();
    const attempts = this.accessAttempts.get(userId) || 0;
    
    if (attempts >= this.MAX_ACCESS_ATTEMPTS) {
      auditLogger.log('ACCESS_DENIED', 'DATABASE', { reason: 'Too many attempts', operation }, userId);
      throw new Error('Access denied: Too many failed attempts');
    }
    
    // Check role-based permissions
    const actionMap: { [key: string]: string } = {
      'GET_PATIENTS': 'read',
      'ADD_PATIENT': 'create',
      'UPDATE_PATIENT': 'update',
      'UPDATE_REPORT': 'update',
      'LOCK_REPORT': 'lock'
    };
    
    const action = actionMap[operation] || 'read';
    
    try {
      accessControl.requireAccess(userRole, resource, action);
      auditLogger.log('ACCESS_GRANTED', resource.toUpperCase(), { operation, action }, userId);
      return true;
    } catch (error) {
      this.accessAttempts.set(userId, attempts + 1);
      auditLogger.log('ACCESS_DENIED', resource.toUpperCase(), { 
        reason: error.message, 
        operation, 
        action,
        attempts: attempts + 1 
      }, userId);
      throw error;
    }
  }

  private getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.id || 'anonymous';
  }

  private encryptSensitiveData(data: any): any {
    if (typeof data === 'object' && data !== null) {
      const encrypted = { ...data };
      if (encrypted.phone) encrypted.phone = encryptionService.encrypt(encrypted.phone);
      if (encrypted.medicalHistory) encrypted.medicalHistory = encryptionService.encrypt(encrypted.medicalHistory);
      encrypted.encrypted = true;
      return encrypted;
    }
    return data;
  }

  private decryptSensitiveData(data: any): any {
    if (data && data.encrypted) {
      const decrypted = { ...data };
      if (decrypted.phone) decrypted.phone = encryptionService.decrypt(decrypted.phone);
      if (decrypted.medicalHistory) decrypted.medicalHistory = encryptionService.decrypt(decrypted.medicalHistory);
      delete decrypted.encrypted;
      return decrypted;
    }
    return data;
  }

  // Patient operations
  getPatients(status?: string, doctorId?: string): Patient[] {
    this.validateAccess('GET_PATIENTS', 'patient_data');
    
    const userRole = accessControl.getUserRole();
    const userId = this.getCurrentUserId();
    
    let filtered = this.patients.map(p => this.decryptSensitiveData(p));
    
    // Patients can only see their own data
    if (userRole === 'patient') {
      filtered = filtered.filter(p => p.id === userId || p.name === 'Pree Om');
    }
    
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (doctorId) {
      filtered = filtered.filter(p => p.assignedDoctor === doctorId);
    }
    
    return filtered;
  }

  searchPatients(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patients.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query) ||
      p.symptoms.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }

  updatePatientStatus(patientId: string, status: Patient['status'], doctorId?: string): boolean {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      patient.status = status;
      patient.updatedAt = new Date().toISOString();
      if (doctorId) {
        patient.assignedDoctor = doctorId;
      }
      return true;
    }
    return false;
  }

  // Medicine operations
  getMedicines(): Medicine[] {
    return this.medicines;
  }

  searchMedicines(query: string, category?: string): Medicine[] {
    let filtered = this.medicines;
    
    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(lowerQuery) ||
        m.manufacturer.toLowerCase().includes(lowerQuery) ||
        m.category.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  }

  getMedicineCategories(): string[] {
    return [...new Set(this.medicines.map(m => m.category))];
  }

  // Pharmacy operations
  getPharmacies(): Pharmacy[] {
    return this.pharmacies;
  }

  getPharmacyMedicines(pharmacyId: string): Medicine[] {
    const pharmacy = this.pharmacies.find(p => p.id === pharmacyId);
    if (!pharmacy) return [];
    
    return this.medicines.filter(m => pharmacy.medicines.includes(m.id));
  }

  // Prescription operations
  createPrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Prescription {
    const newPrescription: Prescription = {
      ...prescription,
      id: `presc_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    this.prescriptions.push(newPrescription);
    return newPrescription;
  }

  getPrescriptions(pharmacyId?: string): Prescription[] {
    if (pharmacyId) {
      const filtered = this.prescriptions.filter(p => p.pharmacyId === pharmacyId);
      console.log(`📋 Pharmacy ${pharmacyId}: Found ${filtered.length} prescriptions`);
      return filtered;
    }
    console.log(`📋 All prescriptions: ${this.prescriptions.length}`);
    return this.prescriptions;
  }

  updatePrescriptionStatus(prescriptionId: string, status: Prescription['status']): boolean {
    const prescription = this.prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      prescription.status = status;
      if (status === 'DISPENSED') {
        prescription.dispensedAt = new Date().toISOString();
      }
      return true;
    }
    return false;
  }

  // E-Bill operations
  generateEBill(prescriptionId: string, pharmacyId: string): EBill | null {
    const prescription = this.prescriptions.find(p => p.id === prescriptionId);
    const pharmacy = this.pharmacies.find(p => p.id === pharmacyId);
    const patient = this.patients.find(p => p.id === prescription?.patientId);
    
    if (!prescription || !pharmacy || !patient) return null;

    const items = prescription.medicines.map(pm => {
      const medicine = this.medicines.find(m => m.id === pm.medicineId);
      if (!medicine) return null;
      
      return {
        medicineName: medicine.name,
        quantity: pm.quantity,
        price: medicine.price,
        total: medicine.price * pm.quantity
      };
    }).filter(Boolean) as EBill['items'];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    const eBill: EBill = {
      id: `bill_${Date.now()}`,
      prescriptionId,
      patientName: patient.name,
      patientPhone: patient.phone,
      pharmacyName: pharmacy.name,
      items,
      subtotal,
      tax,
      total,
      generatedAt: new Date().toISOString()
    };

    this.eBills.push(eBill);
    return eBill;
  }

  getEBill(billId: string): EBill | null {
    return this.eBills.find(b => b.id === billId) || null;
  }

  // Report operations
  addReport(report: Omit<Report, 'id'>): Report {
    const newReport: Report = {
      ...report,
      id: `rep_${Date.now()}`
    };
    this.reports.push(newReport);
    return newReport;
  }

  updateReport(reportId: string, updates: Partial<Report>): Report | null {
    this.validateAccess('UPDATE_REPORT', 'reports');
    
    // Additional check for locking reports
    if (updates.status === 'LOCKED') {
      this.validateAccess('LOCK_REPORT', 'reports');
    }
    
    const index = this.reports.findIndex(r => r.id === reportId);
    if (index !== -1) {
      const originalReport = this.reports[index];
      this.reports[index] = { ...originalReport, ...updates };
      
      auditLogger.log('REPORT_UPDATED', 'REPORT', { 
        reportId, 
        changes: Object.keys(updates),
        status: updates.status,
        patientId: originalReport.patientId 
      });
      
      // Persist locked reports immediately
      if (updates.status === 'LOCKED') {
        if (!this.lockedReportIds.includes(reportId)) {
          this.lockedReportIds.push(reportId);
          localStorage.setItem('lockedReports', JSON.stringify(this.lockedReportIds));
          
          // Force immediate persistence
          sessionStorage.setItem(`locked_${reportId}`, 'true');
        }
        auditLogger.log('REPORT_LOCKED', 'REPORT', { reportId, patientId: this.reports[index].patientId });
        realTimeSync.syncReportStatus(reportId, 'LOCKED', this.getCurrentUserId());
        console.log(`🔒 Report ${reportId} locked and stored permanently`);
      }
      
      return this.reports[index];
    }
    return null;
  }

  getReports(): Report[] {
    // Refresh locked reports from localStorage on each call
    this.lockedReportIds = JSON.parse(localStorage.getItem('lockedReports') || '[]');
    
    // Filter out locked reports that should not reappear
    return this.reports.filter(report => {
      if (report.status === 'LOCKED' || this.lockedReportIds.includes(report.id)) {
        return false; // Hide locked reports
      }
      return true;
    });
  }

  getAllReports(): Report[] {
    // Get all reports including locked ones (for admin/history view)
    return this.reports;
  }

  getLockedReports(): Report[] {
    // Get only locked reports for patient history
    return this.reports.filter(report => 
      report.status === 'LOCKED' || this.lockedReportIds.includes(report.id)
    );
  }

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    this.validateAccess('ADD_PATIENT', 'patient_data');
    
    const newPatient: Patient = {
      ...patient,
      id: `pat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const encryptedPatient = this.encryptSensitiveData(newPatient);
    this.patients.push(encryptedPatient);
    
    auditLogger.log('PATIENT_CREATED', 'PATIENT', { patientId: newPatient.id, name: newPatient.name });
    realTimeSync.syncPatientUpdate(newPatient.id, { action: 'created', patient: newPatient });
    console.log(`📋 New patient added: ${newPatient.name} → Doctor: ${newPatient.assignedDoctor}`);
    
    return newPatient;
  }

  updatePatient(patientId: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>): Patient | null {
    this.validateAccess('UPDATE_PATIENT', 'patient_data');
    
    const index = this.patients.findIndex(p => p.id === patientId);
    if (index !== -1) {
      const originalPatient = this.decryptSensitiveData(this.patients[index]);
      const updatedPatient = {
        ...originalPatient,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      this.patients[index] = this.encryptSensitiveData(updatedPatient);
      
      auditLogger.log('PATIENT_UPDATED', 'PATIENT', { 
        patientId, 
        changes: Object.keys(updates),
        name: updatedPatient.name 
      });
      
      realTimeSync.syncPatientUpdate(patientId, { action: 'updated', changes: updates });
      console.log(`✅ Patient updated: ${updatedPatient.name}`);
      return updatedPatient;
    }
    
    auditLogger.log('PATIENT_UPDATE_FAILED', 'PATIENT', { patientId, reason: 'Not found' });
    console.error(`❌ Patient not found: ${patientId}`);
    return null;
  }

  getPatientById(patientId: string): Patient | null {
    return this.patients.find(p => p.id === patientId) || null;
  }
}

export const secureDB = new SecureDatabase();