// Centralized data service for persistent storage
export class DataService {
  private static instance: DataService;
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Appointments management
  getAppointments() {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize with mock data only if no data exists
    const mockAppointments = [
      {
        id: 'APT_001',
        patientId: '1',
        patientName: 'Pree Om',
        patientToken: 'TOKEN123456',
        doctorId: 'cardiologist',
        doctorName: 'Dr. Rajesh Kumar - Cardiologist',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'SCHEDULED',
        phone: '+91-9853224443',
        assignedSpecialist: 'Cardiology'
      },
      {
        id: 'APT_002',
        patientId: '2',
        patientName: 'Priya Sharma',
        patientToken: 'TOKEN789012',
        doctorId: 'dermatologist',
        doctorName: 'Dr. Priya Sharma - Dermatologist',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:00',
        status: 'SCHEDULED',
        phone: '098-765-4321',
        assignedSpecialist: 'Dermatology'
      }
    ];
    
    this.saveAppointments(mockAppointments);
    return mockAppointments;
  }

  saveAppointments(appointments: any[]) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    // Trigger update event for real-time sync
    window.dispatchEvent(new CustomEvent('appointmentsUpdated', { detail: appointments }));
  }

  updateAppointment(appointmentId: string, updates: any) {
    const appointments = this.getAppointments();
    const updatedAppointments = appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, ...updates } : apt
    );
    this.saveAppointments(updatedAppointments);
    return updatedAppointments;
  }

  // Patients management
  getPatients() {
    const stored = localStorage.getItem('patients');
    if (stored) {
      return JSON.parse(stored);
    }

    // Initialize with mock data and health reports
    const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
    const mockPatients = [
      { id: '1', name: 'Pree Om', age: 28, symptoms: ['chest pain', 'shortness of breath'], phone: '+91-9853224443', status: 'UNDER_REVIEW', createdAt: new Date().toISOString(), reports: [], dataToken: 'TOKEN123456' },
      { id: '2', name: 'Priya Sharma', age: 32, symptoms: ['headache'], phone: '098-765-4321', status: 'PENDING', createdAt: new Date().toISOString(), reports: [] }
    ];
    
    const reportPatients = healthReports.map(report => ({
      id: report.patientId,
      name: report.patientName,
      age: 25,
      symptoms: [report.description],
      phone: '+91-9853224443',
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString(),
      reports: [report],
      dataToken: report.patientToken
    }));
    
    const allPatients = [...mockPatients, ...reportPatients];
    this.savePatients(allPatients);
    return allPatients;
  }

  savePatients(patients: any[]) {
    localStorage.setItem('patients', JSON.stringify(patients));
    window.dispatchEvent(new CustomEvent('patientsUpdated', { detail: patients }));
  }

  updatePatient(patientId: string, updates: any) {
    const patients = this.getPatients();
    const updatedPatients = patients.map(patient => 
      patient.id === patientId ? { ...patient, ...updates } : patient
    );
    this.savePatients(updatedPatients);
    return updatedPatients;
  }

  removePatient(patientId: string) {
    const patients = this.getPatients();
    const updatedPatients = patients.filter(patient => patient.id !== patientId);
    this.savePatients(updatedPatients);
    return updatedPatients;
  }

  // Doctor assignments
  getAssignedDoctors() {
    return JSON.parse(localStorage.getItem('assignedDoctors') || '{}');
  }

  saveAssignedDoctors(assignments: any) {
    localStorage.setItem('assignedDoctors', JSON.stringify(assignments));
    window.dispatchEvent(new CustomEvent('doctorAssignmentsUpdated', { detail: assignments }));
  }

  assignDoctor(patientId: string, doctorName: string) {
    const assignments = this.getAssignedDoctors();
    assignments[patientId] = doctorName;
    this.saveAssignedDoctors(assignments);
    return assignments;
  }

  // Prescriptions
  getPrescriptions() {
    return JSON.parse(localStorage.getItem('prescriptions') || '[]');
  }

  savePrescriptions(prescriptions: any[]) {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    window.dispatchEvent(new CustomEvent('prescriptionsUpdated', { detail: prescriptions }));
  }

  addPrescription(prescription: any) {
    const prescriptions = this.getPrescriptions();
    prescriptions.push(prescription);
    this.savePrescriptions(prescriptions);
    return prescriptions;
  }

  // Emergencies
  getEmergencies() {
    return JSON.parse(localStorage.getItem('emergencies') || '[]');
  }

  saveEmergencies(emergencies: any[]) {
    localStorage.setItem('emergencies', JSON.stringify(emergencies));
    window.dispatchEvent(new CustomEvent('emergenciesUpdated', { detail: emergencies }));
  }

  addEmergency(emergency: any) {
    const emergencies = this.getEmergencies();
    emergencies.push(emergency);
    this.saveEmergencies(emergencies);
    return emergencies;
  }
}

export const dataService = DataService.getInstance();