import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DoctorAIPanel } from '@/components/medical/DoctorAIPanel';
import { MedicalReportEditor } from '@/components/medical/MedicalReportEditor';
import { ComplianceAlert } from '@/components/medical/ComplianceAlert';
import { ClinicalInsightsPanel } from '@/components/medical/ClinicalInsightsPanel';
import { AICouncilTest } from '@/components/medical/AICouncilTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, Brain, AlertTriangle, Search, Pill } from 'lucide-react';
import { AICouncilResponse, MedicalReport, PatientData } from '@/types/medical';
import { aiCouncil } from '@/lib/aiCouncil';
import { authService } from '@/lib/auth';
import { complianceService } from '@/lib/compliance';
import { secureDB } from '@/lib/secureDatabase';
import { ToastService } from '@/components/ui/toast-notification';
import { analytics } from '@/lib/analytics';
import { realTimeUpdates } from '@/lib/realTimeUpdates';

export default function DoctorDashboard() {
  const [aiInsights, setAiInsights] = useState<AICouncilResponse | undefined>();
  const [currentReport, setCurrentReport] = useState<MedicalReport | undefined>();
  const [clinicalData, setClinicalData] = useState<any>();
  const [showClinicalInsights, setShowClinicalInsights] = useState(false);
  const [pendingPatients, setPendingPatients] = useState(secureDB.getPatients('PENDING'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [pharmacies] = useState(secureDB.getPharmacies());

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isDoctor()) {
      window.location.href = '/login';
    }
    refreshPatients();
    
    // Enterprise-level real-time updates
    realTimeUpdates.startRealtimeSync();
    
    const unsubscribePatients = realTimeUpdates.subscribe('patients:updated', () => {
      refreshPatients();
    });
    
    const unsubscribeReports = realTimeUpdates.subscribe('reports:updated', () => {
      refreshPatients();
    });
    
    const unsubscribeSync = realTimeUpdates.subscribe('system:sync', (data) => {
      ToastService.show(`Hospital system sync: ${data.records_synced} records updated`, 'info', 3000);
    });
    
    realTimeUpdates.syncWithHospitalSystem();
    
    return () => {
      unsubscribePatients();
      unsubscribeReports();
      unsubscribeSync();
    };
  }, []);

  const refreshPatients = () => {
    const currentDoctorId = authService.getCurrentUser()?.id;
    // Get patients assigned to current doctor or unassigned pending patients
    const allPending = secureDB.getPatients('PENDING');
    const assignedToMe = allPending.filter(p => 
      p.assignedDoctor === 'd1' || p.assignedDoctor === 'd2' || !p.assignedDoctor
    );
    setPendingPatients(assignedToMe);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = secureDB.searchPatients(searchTerm);
      const pendingResults = results.filter(p => p.status === 'PENDING');
      setPendingPatients(pendingResults);
      ToastService.show(`Found ${pendingResults.length} patients matching "${searchTerm}"`, 'info');
    } else {
      refreshPatients();
      ToastService.show('Showing all pending patients', 'info');
    }
  };

  const handleToggleAI = async (enabled: boolean) => {
    if (enabled) {
      try {
        complianceService.enforceAIAccess();
        
        const mockPatientData: PatientData = {
          id: '1',
          symptoms: ['chest pain', 'shortness of breath'],
          medical_history: 'Hypertension, diabetes',
          reports: [],
          encrypted: true,
          tokenized: true
        };

        const insights = await aiCouncil.generateClinicalInsights(mockPatientData);
        setAiInsights(insights);
        
        if (insights.workflow_data) {
          setClinicalData({
            differentialDiagnoses: insights.workflow_data.differential_diagnoses,
            riskAssessment: {
              triageLevel: insights.workflow_data.triage_level,
              redFlags: insights.risk_flags.map(flag => ({ flag, severity: 'MODERATE', action: 'Monitor closely' }))
            }
          });
          setShowClinicalInsights(true);
        }
        
        const reportContent = await aiCouncil.generateMedicalReport(mockPatientData, insights);
        const newReport: MedicalReport = {
          id: Date.now().toString(),
          patient_id: mockPatientData.id,
          doctor_id: authService.getCurrentUser()?.id || '',
          ai_draft: insights,
          final_report: reportContent,
          status: 'AI_ASSISTED',
          created_at: new Date().toISOString(),
          compliance_disclaimer: aiCouncil.getComplianceDisclaimer()
        };
        setCurrentReport(newReport);
        
      } catch (error) {
        console.error('AI Council access denied:', error);
        alert('AI Council access denied. Doctor authentication required.');
      }
    } else {
      setAiInsights(undefined);
      setClinicalData(undefined);
      setShowClinicalInsights(false);
    }
  };

  const handleAcceptInsight = (insight: string) => {
    alert(`Accepted insight: ${insight}`);
    if (currentReport) {
      const updatedReport = {
        ...currentReport,
        final_report: currentReport.final_report + `\n\nAccepted AI Insight: ${insight}`
      };
      setCurrentReport(updatedReport);
    }
  };

  const handleRejectInsight = (insight: string) => {
    alert(`Rejected insight: ${insight}`);
  };

  const handleReviewPatient = (patientId: string) => {
    const patient = secureDB.getPatients().find(p => p.id === patientId);
    if (patient) {
      // Update patient status to under review
      secureDB.updatePatientStatus(patientId, 'UNDER_REVIEW', authService.getCurrentUser()?.id);
      
      const reportContent = `Patient: ${patient.name}\nAge: ${patient.age}\nSymptoms: ${patient.symptoms.join(', ')}\nPhone: ${patient.phone}\n\nInitial Assessment:\n[To be completed by doctor]\n\nDiagnosis:\n[To be completed by doctor]\n\nTreatment Plan:\n[To be completed by doctor]`;
      
      const newReport: MedicalReport = {
        id: Date.now().toString(),
        patient_id: patient.id,
        doctor_id: authService.getCurrentUser()?.id || '',
        final_report: reportContent,
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        compliance_disclaimer: aiCouncil.getComplianceDisclaimer()
      };
      setCurrentReport(newReport);
      refreshPatients();
    }
  };

  const handleSaveReport = (report: MedicalReport) => {
    complianceService.logReportGeneration(report);
    secureDB.addReport({
      patientId: report.patient_id,
      doctorId: report.doctor_id,
      content: report.final_report,
      status: report.status,
      date: new Date().toISOString().split('T')[0]
    });
    setCurrentReport(report);
    ToastService.show('Report saved successfully!', 'success');
  };

  const handleApproveReport = (report: MedicalReport) => {
    if (complianceService.validateReportApproval(report)) {
      const approvedReport = { ...report, status: 'DOCTOR_APPROVED' as const };
      complianceService.logReportGeneration(approvedReport);
      
      // Update report in database
      secureDB.updateReport(report.id, {
        status: 'DOCTOR_APPROVED',
        content: report.final_report,
        approvedAt: new Date().toISOString()
      });

      // Update patient status to completed
      secureDB.updatePatientStatus(report.patient_id, 'COMPLETED');
      
      // Track analytics
      analytics.trackReportGeneration(report.id, report.doctor_id, report.patient_id, !!report.ai_draft);
      
      // Emit real-time update for enterprise system
      realTimeUpdates.emit('reports:updated', {
        action: 'approved',
        reportId: report.id,
        patientId: report.patient_id,
        timestamp: new Date().toISOString()
      });
      
      // Create prescription if pharmacy is selected
      if (selectedPharmacy) {
        const prescription = secureDB.createPrescription({
          reportId: report.id,
          patientId: report.patient_id,
          doctorId: report.doctor_id,
          pharmacyId: selectedPharmacy,
          medicines: [
            {
              medicineId: 'med_1', // Paracetamol
              quantity: 10,
              dosage: '500mg twice daily',
              duration: '5 days'
            }
          ],
          status: 'PENDING'
        });
        
        const pharmacyName = pharmacies.find(p => p.id === selectedPharmacy)?.name;
        ToastService.show(`Report approved! Prescription sent to ${pharmacyName}`, 'success');
      } else {
        ToastService.show('Report approved and locked successfully!', 'success');
      }
      
      setCurrentReport(approvedReport);
      refreshPatients();
    } else {
      ToastService.show('Report approval failed - validation error', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              Clinical decision support with AI assistance
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            AI Council Active
          </Badge>
        </div>

        <ComplianceAlert type="doctor_only" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending Patients ({pendingPatients.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
                    />
                    <Button variant="outline" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.symptoms.join(', ')}</p>
                        <p className="text-xs text-gray-500">
                          Age: {patient.age} | Phone: {patient.phone} | 
                          Status: <span className="font-medium">{patient.status}</span>
                          {patient.dataToken && (
                            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              Token: {patient.dataToken.substr(0, 8)}...
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {patient.reports.length} Reports
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleReviewPatient(patient.id)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingPatients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending patients found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {currentReport && (
              <Card>
                <CardHeader>
                  <CardTitle>Medical Report Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MedicalReportEditor
                    report={currentReport}
                    onSave={handleSaveReport}
                    onApprove={handleApproveReport}
                  />
                  
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium mb-2 block">
                      <Pill className="h-4 w-4 inline mr-1" />
                      Select Pharmacy for Prescription
                    </label>
                    <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose pharmacy..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pharmacies.map((pharmacy) => (
                          <SelectItem key={pharmacy.id} value={pharmacy.id}>
                            {pharmacy.name} - {pharmacy.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <DoctorAIPanel
              aiInsights={aiInsights}
              onToggleAI={handleToggleAI}
              onAcceptInsight={handleAcceptInsight}
              onRejectInsight={handleRejectInsight}
            />

            <ClinicalInsightsPanel
              clinicalData={clinicalData}
              isVisible={showClinicalInsights}
            />

            <AICouncilTest />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• All AI-assisted reports require doctor approval</p>
                  <p>• Patient data is encrypted and tokenized</p>
                  <p>• AI Council access logged for audit</p>
                  <p>• Prescriptions automatically sent to selected pharmacy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}