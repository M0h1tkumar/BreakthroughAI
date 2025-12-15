import { MongoClient, Db, Collection } from 'mongodb';

const MONGO_URI = 'mongodb+srv://preeom45_db_user:slKyh3xr5zf7v5Un@cluster0.hgskacd.mongodb.net/';
const DB_NAME = 'swasth_ai_db';

interface Patient {
  _id?: string;
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
}

interface Report {
  _id?: string;
  id: string;
  patientId: string;
  doctorId: string;
  content: string;
  status: 'DRAFT' | 'AI_ASSISTED' | 'DOCTOR_APPROVED' | 'LOCKED';
  prescriptions?: any[];
  date: string;
  approvedAt?: string;
}

class MongoDatabase {
  private client: MongoClient;
  private db: Db | null = null;
  private connected = false;

  constructor() {
    this.client = new MongoClient(MONGO_URI, {
      ssl: true,
      authSource: 'admin'
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      this.connected = true;
      console.log('✅ MongoDB connected securely');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  private async getCollection<T>(name: string): Promise<Collection<T>> {
    if (!this.connected || !this.db) {
      await this.connect();
    }
    return this.db!.collection<T>(name);
  }

  // Patient operations
  async getPatients(status?: string, doctorId?: string): Promise<Patient[]> {
    const collection = await this.getCollection<Patient>('patients');
    const filter: any = {};
    
    if (status) filter.status = status;
    if (doctorId) filter.assignedDoctor = doctorId;
    
    return await collection.find(filter).toArray();
  }

  async addPatient(patient: Omit<Patient, '_id'>): Promise<Patient> {
    const collection = await this.getCollection<Patient>('patients');
    const result = await collection.insertOne(patient as Patient);
    return { ...patient, _id: result.insertedId.toString() } as Patient;
  }

  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<Patient | null> {
    const collection = await this.getCollection<Patient>('patients');
    const result = await collection.findOneAndUpdate(
      { id: patientId },
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  // Report operations
  async getReports(): Promise<Report[]> {
    const collection = await this.getCollection<Report>('reports');
    return await collection.find({ status: { $ne: 'LOCKED' } }).toArray();
  }

  async addReport(report: Omit<Report, '_id'>): Promise<Report> {
    const collection = await this.getCollection<Report>('reports');
    const result = await collection.insertOne(report as Report);
    return { ...report, _id: result.insertedId.toString() } as Report;
  }

  async updateReport(reportId: string, updates: Partial<Report>): Promise<Report | null> {
    const collection = await this.getCollection<Report>('reports');
    const result = await collection.findOneAndUpdate(
      { id: reportId },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (updates.status === 'LOCKED') {
      console.log(`🔒 Report ${reportId} locked in MongoDB`);
    }
    
    return result || null;
  }

  async getLockedReports(): Promise<Report[]> {
    const collection = await this.getCollection<Report>('reports');
    return await collection.find({ status: 'LOCKED' }).toArray();
  }

  // Prescription operations
  async createPrescription(prescription: any): Promise<any> {
    const collection = await this.getCollection('prescriptions');
    const newPrescription = {
      ...prescription,
      id: `presc_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    await collection.insertOne(newPrescription);
    return newPrescription;
  }

  async getPrescriptions(pharmacyId?: string): Promise<any[]> {
    const collection = await this.getCollection('prescriptions');
    const filter = pharmacyId ? { pharmacyId } : {};
    return await collection.find(filter).toArray();
  }

  async updatePrescriptionStatus(prescriptionId: string, status: string): Promise<boolean> {
    const collection = await this.getCollection('prescriptions');
    const updates: any = { status };
    
    if (status === 'DISPENSED') {
      updates.dispensedAt = new Date().toISOString();
    }
    
    const result = await collection.updateOne(
      { id: prescriptionId },
      { $set: updates }
    );
    
    return result.modifiedCount > 0;
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const patientsCollection = await this.getCollection<Patient>('patients');
    const reportsCollection = await this.getCollection<Report>('reports');
    
    const patientCount = await patientsCollection.countDocuments();
    
    if (patientCount === 0) {
      const samplePatients: Patient[] = [
        {
          id: '1',
          name: 'Raj Kumar',
          age: 45,
          phone: '9853224433',
          symptoms: ['chest pain', 'shortness of breath'],
          reports: ['r1'],
          status: 'PENDING',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          age: 32,
          phone: '9876543211',
          symptoms: ['fever', 'cough'],
          reports: ['r2'],
          status: 'UNDER_REVIEW',
          assignedDoctor: 'd1',
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-16T11:00:00Z'
        }
      ];

      const sampleReports: Report[] = [
        {
          id: 'r1',
          patientId: '1',
          doctorId: 'd1',
          content: 'Cardiac examination normal. Recommend stress test.',
          status: 'DRAFT',
          date: '2024-01-15'
        },
        {
          id: 'r2',
          patientId: '2',
          doctorId: 'd1',
          content: 'Viral fever treatment prescribed.',
          status: 'DOCTOR_APPROVED',
          date: '2024-01-16',
          approvedAt: '2024-01-16T15:00:00Z'
        }
      ];

      await patientsCollection.insertMany(samplePatients);
      await reportsCollection.insertMany(sampleReports);
      
      console.log('✅ Sample data initialized in MongoDB');
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
      console.log('🔌 MongoDB disconnected');
    }
  }
}

export const mongoDB = new MongoDatabase();