export type UserRole = 'DOCTOR' | 'PATIENT' | 'PHARMACY';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  licenseNumber?: string; // Required for doctors
  verified: boolean;
}

export interface AICouncilResponse {
  generated_by: 'AI Council';
  purpose: 'Clinical decision support';
  medical_disclaimer: 'Not a diagnosis. Doctor interpretation required.';
  confidence_score: number;
  insights: string[];
  risk_flags: string[];
  timestamp: string;
  model_version: string;
  workflow_data?: {
    differential_diagnoses: any[];
    triage_level: string;
    final_synthesis: string;
  };
}

export interface MedicalReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  ai_draft?: AICouncilResponse;
  final_report: string;
  status: 'DRAFT' | 'AI_ASSISTED' | 'DOCTOR_APPROVED' | 'LOCKED';
  created_at: string;
  approved_at?: string;
  compliance_disclaimer: string;
}

export interface PatientData {
  id: string;
  symptoms: string[];
  medical_history: string;
  reports: string[];
  encrypted: boolean;
  tokenized: boolean;
}